// Improved outreach template generator
// Creates more personalized outreach messages with varied language

/**
 * Generates an outreach message with varied professional language
 * @param {Object} data - The contact data
 * @returns {Object} - Object containing varied message parts
 */
function generateImprovedOutreachMessage(data) {
  // Get varied intro phrase instead of "your work has been inspirational to us"
  const introPhrase = getVariedIntroPhrase(data.field);
  
  // Generate personalized first paragraph
  const paragraph1 = `Dear ${data.name}, ${introPhrase} Your insight that "${data.quote}" resonates with our mission at DA1.`;
  
  // Generate second paragraph about DA1
  const paragraph2 = getPersonalizedDA1Paragraph(data.field);
  
  // Generate a tweet with varied structure
  const tweet = generateTweet(data);
  
  return {
    paragraph1,
    paragraph2,
    tweet
  };
}

/**
 * Returns a varied introduction phrase based on the contact's field
 * @param {string} field - The contact's field
 * @returns {string} - A varied introduction phrase
 */
function getVariedIntroPhrase(field) {
  const phrases = [
    `we're following your work in the ${field} space with interest and appreciation.`,
    `your strategic outlook on ${field} complements the goals of DA1.`,
    `we've referenced your commentary on ${field} while designing key aspects of DA1.`,
    `we appreciate your consistent voice in ${field} and are following your updates closely.`,
    `your work brings steady insight to ${field}, which we value.`,
    `we see clear intersections between your work in ${field} and our current focus at DA1.`,
    `your contributions to the broader ${field} ecosystem are part of the foundation we're building on.`,
    `we're paying close attention to your insights in ${field} as they relate to our efforts.`,
    `we value your perspective on ${field} and its implications for attribution systems.`,
    `at DA1, we appreciate the clarity you bring to discussions of ${field}.`,
    `your observations in ${field} provide helpful framing for issues we're working on.`,
    `your approach to ${field} is informing some of our strategy discussions.`,
    `your work highlights practical challenges in ${field} that we're also working to resolve.`,
    `we've engaged with your work in ${field} as part of our internal development.`,
    `we're closely aligned with your observations on systemic issues in ${field}.`,
    `your thinking around ${field} is contributing to how we approach attribution and structure.`
  ];
  
  // Select a random phrase
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * Returns a personalized DA1 paragraph based on the contact's field
 * @param {string} field - The contact's field
 * @returns {string} - A personalized DA1 paragraph
 */
function getPersonalizedDA1Paragraph(field) {
  const fieldLower = field.toLowerCase();
  
  // Field-specific paragraphs
  const paragraphs = {
    music: "At DA1, we've developed a metaMetadata system that ensures attribution data persists throughout the digital journey of music files. Our approach creates a persistent layer of attribution that survives when content travels across streaming platforms that typically strip this data, ensuring musicians receive proper credit and compensation.",
    
    photography: "At DA1, we've developed a metaMetadata system that preserves image attribution data even when files are shared across social platforms. Our approach creates a persistent layer of attribution that survives the usual metadata stripping processes, ensuring photographers maintain proper credit for their work.",
    
    video: "At DA1, we've developed a metaMetadata system that preserves video attribution data across distribution channels. Our approach creates a persistent layer of attribution that survives when content travels across platforms that typically strip this data, ensuring filmmakers maintain proper credit and control.",
    
    investment: "At DA1, we've developed a metaMetadata system that creates sustainable economic models around digital attribution. Our approach addresses the billion-dollar problem in royalty and rights management by ensuring attribution data persists even when content travels across platforms.",
    
    technology: "At DA1, we've developed a metaMetadata architecture that functions across platforms regardless of their internal metadata handling practices. Our approach creates a persistent attribution layer that addresses the technical challenges of maintaining creator information throughout the digital ecosystem.",
    
    publishing: "At DA1, we've developed a metaMetadata system that preserves critical attribution information for written works as they travel across digital platforms. Our approach ensures that publishing rights and creator information survive even when traditional metadata is stripped."
  };
  
  // Default paragraph if field-specific one isn't available
  const defaultParagraph = "At DA1, we've developed a metaMetadata system that ensures attribution data persists throughout the entire digital journey of creative work. Our approach creates a persistent layer of attribution that survives when content travels across platforms that typically strip this data.";
  
  // Return field-specific paragraph or default
  for (const key in paragraphs) {
    if (fieldLower.includes(key)) {
      return paragraphs[key];
    }
  }
  
  return defaultParagraph;
}

/**
 * Generates a tweet with varied structure
 * @param {Object} data - The contact data
 * @returns {string} - A tweet
 */
function generateTweet(data) {
  const tweetTemplates = [
    `@${data.twitterHandle.replace('@', '')} Did you really say "${data.quote.substring(0, 70)}..."? This aligns with our work at DA1 on solving attribution challenges. #DigitalAttribution #CreatorRights`,
    
    `I've been following @${data.twitterHandle.replace('@', '')}'s work on ${data.field}. Your perspective that "${data.quote.substring(0, 60)}..." resonates with our mission at DA1. #MetadataPersistence`,
    
    `"${data.quote.substring(0, 70)}..." - This insight from @${data.twitterHandle.replace('@', '')} captures exactly what we're addressing with DA1's metaMetadata system. #Attribution #CreativeRights`,
    
    `@${data.twitterHandle.replace('@', '')}'s work in ${data.field} highlights why proper attribution matters. We'd love to show you how DA1 solves the challenges you've identified. #CreatorEconomy`,
    
    `Working on metadata solutions at DA1 and appreciate @${data.twitterHandle.replace('@', '')}'s contributions to the field. Would you be open to discussing our approach? #DigitalRights`
  ];
  
  // Select a random tweet template
  return tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];
}

module.exports = {
  generateImprovedOutreachMessage
};