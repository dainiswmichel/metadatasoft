// lib/audioQueue.js
const Queue = require('bull');
const path = require('path');
const os = require('os');
const { EventEmitter } = require('events');

class AudioProcessingQueue extends EventEmitter {
  constructor(config) {
    super();
    this.config = config || {};
    this.redisUrl = this.config.redisUrl || 'redis://127.0.0.1:6379';
    this.concurrency = this.config.concurrency || 2; // Default concurrent processing
    this.audioProcessor = require('./audioProcessor');
    
    // Initialize the queue
    this.queue = new Queue('audioProcessing', this.redisUrl);
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Set up processor
    this.setupProcessor();
    
    console.log(`Audio processing queue initialized with concurrency: ${this.concurrency}`);
  }
  
  setupEventHandlers() {
    // Listen for completed jobs
    this.queue.on('completed', (job, result) => {
      console.log(`Job ${job.id} completed with result:`, result);
      this.emit('job:completed', { jobId: job.id, result });
    });
    
    // Listen for failed jobs
    this.queue.on('failed', (job, error) => {
      console.error(`Job ${job.id} failed with error:`, error);
      this.emit('job:failed', { jobId: job.id, error: error.message });
    });
    
    // Listen for stalled jobs (jobs that have been taken by a worker but not completed)
    this.queue.on('stalled', (job) => {
      console.warn(`Job ${job.id} is stalled`);
      this.emit('job:stalled', { jobId: job.id });
    });
  }
  
  setupProcessor() {
    // Process jobs with the specified concurrency
    this.queue.process(this.concurrency, async (job) => {
      const { inputPath, outputPath, metadata, options } = job.data;
      console.log(`Processing job ${job.id}: ${inputPath}`);
      
      try {
        // Update job progress
        await job.progress(10);
        
        // Determine destination path if not provided
        const finalOutputPath = outputPath || path.join(
          this.config.outputDir || os.tmpdir(),
          `processed_${Date.now()}${path.extname(inputPath)}`
        );
        
        // Process the audio file
        await job.progress(20);
        const result = await this.audioProcessor.processAudio(inputPath, finalOutputPath, metadata);
        
        // Update job progress
        await job.progress(100);
        
        // Return the result
        return {
          inputPath,
          outputPath: result,
          metadata,
          success: true
        };
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        throw new Error(`Audio processing failed: ${error.message}`);
      }
    });
  }
  
  /**
   * Add an audio processing job to the queue
   * @param {Object} jobData - Job data
   * @param {string} jobData.inputPath - Path to the input audio file
   * @param {string} [jobData.outputPath] - Optional path for the output file
   * @param {Object} [jobData.metadata] - Optional metadata to embed
   * @param {Object} [jobData.options] - Optional processing options
   * @param {Object} [opts] - Bull queue options
   * @returns {Promise<Object>} - Job object with id
   */
  async addJob(jobData, opts = {}) {
    if (!jobData.inputPath) {
      throw new Error('Input path is required');
    }
    
    // Add job to the queue
    const job = await this.queue.add(jobData, {
      attempts: 3, // Retry up to 3 times
      backoff: {
        type: 'exponential',
        delay: 1000 // Initial delay of 1 second
      },
      removeOnComplete: false, // Keep completed jobs for history
      removeOnFail: false, // Keep failed jobs for troubleshooting
      ...opts
    });
    
    console.log(`Added job ${job.id} to queue: ${jobData.inputPath}`);
    return {
      jobId: job.id,
      inputPath: jobData.inputPath
    };
  }
  
  /**
   * Get the status of a job
   * @param {string} jobId - The job ID to check
   * @returns {Promise<Object>} - Job status information
   */
  async getJobStatus(jobId) {
    const job = await this.queue.getJob(jobId);
    
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    const state = await job.getState();
    const progress = job._progress;
    
    return {
      jobId: job.id,
      state,
      progress,
      data: job.data,
      result: job.returnvalue,
      error: job.failedReason,
      attempts: job.attemptsMade,
      createdAt: job.timestamp,
      processedAt: job.processedOn
    };
  }
  
  /**
   * Get all jobs in the queue
   * @returns {Promise<Object>} - Object containing jobs by status
   */
  async getAllJobs() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaiting(),
      this.queue.getActive(),
      this.queue.getCompleted(),
      this.queue.getFailed()
    ]);
    
    return {
      waiting,
      active,
      completed,
      failed,
      counts: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length
      }
    };
  }
  
  /**
   * Clean up completed and failed jobs
   * @param {Object} options - Cleanup options
   * @param {number} [options.age=3600000] - Age in ms (default: 1 hour)
   * @returns {Promise<Object>} - Counts of removed jobs
   */
  async cleanup(options = {}) {
    const age = options.age || 3600000; // Default to 1 hour
    
    const [completedCount, failedCount] = await Promise.all([
      this.queue.clean(age, 'completed'),
      this.queue.clean(age, 'failed')
    ]);
    
    return {
      completed: completedCount,
      failed: failedCount,
      total: completedCount + failedCount
    };
  }
  
  /**
   * Close the queue (for cleanup)
   */
  async close() {
    await this.queue.close();
    console.log('Audio processing queue closed');
  }
}

module.exports = AudioProcessingQueue;
