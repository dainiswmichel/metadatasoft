/**
 * ==========================================
 * DA1.FM - Utils Tests
 * ==========================================
 * 
 * Unit tests for the utility functions
 */

const utils = require('../backend/utils');

describe('Utils Module', () => {
  describe('sanitizeForXML', () => {
    test('should replace special XML characters with entities', () => {
      const input = '<title>Hello & "World"</title>';
      const expected = '&lt;title&gt;Hello &amp; &quot;World&quot;&lt;/title&gt;';
      expect(utils.sanitizeForXML(input)).toBe(expected);
    });
    
    test('should return empty string for non-string input', () => {
      expect(utils.sanitizeForXML(null)).toBe('');
      expect(utils.sanitizeForXML(undefined)).toBe('');
      expect(utils.sanitizeForXML(123)).toBe('');
      expect(utils.sanitizeForXML({})).toBe('');
    });
  });
  
  describe('sanitizeForShell', () => {
    test('should escape single quotes properly', () => {
      const input = "O'Reilly";
      const expected = "O\\'Reilly";
      expect(utils.sanitizeForShell(input)).toBe(expected);
    });
    
    test('should return empty string for non-string input', () => {
      expect(utils.sanitizeForShell(null)).toBe('');
      expect(utils.sanitizeForShell(undefined)).toBe('');
      expect(utils.sanitizeForShell(123)).toBe('');
      expect(utils.sanitizeForShell({})).toBe('');
    });
  });
  
  describe('generateSecureId', () => {
    test('should generate an ID with the specified length', () => {
      const id = utils.generateSecureId(8);
      expect(id.length).toBe(16); // 8 bytes = 16 hex characters
    });
    
    test('should generate different IDs on each call', () => {
      const id1 = utils.generateSecureId();
      const id2 = utils.generateSecureId();
      expect(id1).not.toBe(id2);
    });
  });
  
  describe('generateSafeFilename', () => {
    test('should convert spaces to underscores', () => {
      const result = utils.generateSafeFilename('My Song Title', 'mp3');
      expect(result).toBe('my_song_title.mp3');
    });
    
    test('should remove special characters', () => {
      const result = utils.generateSafeFilename('Song & "Artist" - 2023!', 'flac');
      expect(result).toBe('song__artist__2023.flac');
    });
    
    test('should add suffix when provided', () => {
      const result = utils.generateSafeFilename('My Song', 'mp3', '_high');
      expect(result).toBe('my_song_high.mp3');
    });
  });
});
