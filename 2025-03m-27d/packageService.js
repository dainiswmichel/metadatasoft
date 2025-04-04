/**
 * ==========================================
 * DA1.FM - Package Service Module (CLEAN VERSION)
 * ==========================================
 *
 * Handles the creation and management of DA1 packages:
 * - Creates DA1 folder structure
 * - Copies and organizes raw output files (NO ZIPS)
 * - Generates metadata and hash files
 * - Finalizes DA1 packages for download
 *
 * Author: Dainis Michel & Team
 * Revised: 2025-03-16
 */

const fs = require('fs');
const path = require('path');
const { FOLDER_STRUCTURE } = require('./constants');
const metadataService = require('./metadataService');
const utils = require('./utils');

/**
 * Create DA1 folder structure
 * @param {string} basePath - Base directory for the DA1 package
 * @param {string} folderName - Name of the DA1 folder (song/project title)
 * @returns {Object} Paths to created directories
 */
function createDA1FolderStructure(basePath, folderName) {
    const packagePath = path.join(basePath, folderName);
    const paths = {
        base: packagePath,
        audio: path.join(packagePath, 'audio'),
        video: path.join(packagePath, 'video'),
        pdf: path.join(packagePath, 'pdf'),
        images: path.join(packagePath, 'images'),
        metadata: path.join(packagePath, 'metadata'),
        hashes: path.join(packagePath, 'hashes'),
    };

    Object.values(paths).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    return paths;
}

/**
 * Copy raw output files to appropriate folders (NO ZIPS)
 * @param {Object} files - Object with categorized files { audio: [], video: [], pdf: [], images: [] }
 * @param {Object} paths - Paths to DA1 subfolders
 */
function copyFilesToPackage(files, paths) {
    Object.entries(files).forEach(([type, fileArray]) => {
        const targetPath = paths[type];
        fileArray.forEach(file => {
            const filename = path.basename(file);
            fs.copyFileSync(file, path.join(targetPath, filename));
        });
    });
}

/**
 * Generate and save metadata XML
 * @param {Object} metaData - Metadata object
 * @param {string} targetPath - Where to save the metadata XML file
 */
function saveMetadataFile(metaData, targetPath) {
    const xmlData = metadataService.generateMetadataXML(metaData);
    const filePath = path.join(targetPath, 'metadata.xml');
    fs.writeFileSync(filePath, xmlData);
}

/**
 * Generate hash files for package integrity
 * @param {string} packagePath - Base DA1 folder path
 * @param {string} targetPath - Hashes subfolder path
 */
function generateHashFiles(packagePath, targetPath) {
    const hashResults = utils.generateHashesForFolder(packagePath);
    const filePath = path.join(targetPath, 'hashes.json');
    fs.writeFileSync(filePath, JSON.stringify(hashResults, null, 2));
}

/**
 * Package DA1 content (main orchestrator)
 * @param {Object} options - { basePath, folderName, files, metaData }
 */
function createDA1Package(options) {
    const { basePath, folderName, files, metaData } = options;

    console.log(`[DA1] Creating package: ${folderName}`);

    // Step 1: Create folder structure
    const paths = createDA1FolderStructure(basePath, folderName);

    // Step 2: Copy raw files
    copyFilesToPackage(files, paths);

    // Step 3: Save metadata
    saveMetadataFile(metaData, paths.metadata);

    // Step 4: Generate hash files
    generateHashFiles(paths.base, paths.hashes);

    console.log(`[DA1] Package ${folderName} created at ${paths.base}`);
}

module.exports = {
    createDA1Package,
};
