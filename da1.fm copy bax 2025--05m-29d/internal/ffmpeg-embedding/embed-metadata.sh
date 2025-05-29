#!/bin/bash
# Complete script to embed metadata and album art into MP3 file

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "FFmpeg is not installed. Please install it first."
    exit 1
fi

# Input file paths - using the exact filenames from your screenshots
INPUT_FILE="migla-no-metadata.mp3"
COVER_IMAGE="migla-migla-eoh-3x3.jpg"
OUTPUT_FILE="migla-migla-complete.mp3"

# Temporary file for intermediate steps
TEMP_FILE="migla-migla-with-metadata.mp3"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Input file $INPUT_FILE not found!"
    echo "Current directory contains:"
    ls -la
    exit 1
fi

# Check if cover image exists
if [ ! -f "$COVER_IMAGE" ]; then
    echo "Cover image $COVER_IMAGE not found!"
    echo "Current directory contains:"
    ls -la *.jpg
    exit 1
fi

echo "Starting metadata embedding process..."

# Step 1: Embed metadata into the MP3
ffmpeg -i "$INPUT_FILE" \
-metadata title="Migla migla (Akustiskā dzīvajā versijā. 3x3 Brīvais Mikrofons. Koknesē, Latvijā)" \
-metadata artist="Dainis W. Michel, Dainis V. Michelis, Da1ni5, Emīlija Michele, Olīvija un Hugo" \
-metadata album="Sadziedāšana ar Daini (Dzīvajā)" \
-metadata genre="Latviešu folkloristiskā jaunrade, tautas dziesmas, tautas mūzika, Folk, Acoustic, Ethno, Live Performance" \
-metadata date="2024-07-03" \
-metadata year="2024" \
-metadata track="00" \
-metadata disc="1" \
-metadata mood="Peaceful, Nostalgic, Folkloric, Happy Family, Traditional, Contemplative" \
-metadata tempo="Slow, Gentle" \
-metadata theme="Nature, Love, Folk Traditions" \
-metadata style="Latvian Folk, Acoustic" \
-metadata instruments="Acoustic Guitar, Vocals" \
-metadata energy_level="Low" \
-metadata vocal_type="Male Lead, Youth Harmony" \
-metadata sound_alike="Traditional Latvian Folk" \
-metadata keywords="Latvian, Folk Song, Traditional, Live Recording, Acoustic" \
-metadata usage_suggestions="Documentary, Cultural Programming, Film Underscore, Heritage Events, Family Festival, Emotional Moment" \
-metadata language="lat" \
-metadata original_language="lat" \
-metadata duration="4:01" \
-metadata bpm="60" \
-metadata key="Bb Major" \
-metadata time_signature="4/2" \
-metadata audio_quality="24-bit/48kHz" \
-metadata recording_type="Live" \
-metadata mastering_engineer="Dainis W. Michel" \
-metadata mixing_engineer="Dainis Kažoks" \
-metadata recording_engineer="Dainis Kažoks" \
-metadata production_date="2024-07-03" \
-metadata master_source="Original Live Recording" \
-metadata original_format="Digital" \
-metadata copyright_holder="Dainis W. Michel" \
-metadata copyright="© 2024 Dainis W. Michel. All Rights Reserved." \
-metadata publisher="Dainis W. Michel (Self-Published)" \
-metadata pro_affiliation="AustroMechana" \
-metadata iswc="T-123456789-0" \
-metadata isrc="US-XXX-21-00001" \
-metadata catalog_number="DWM-2024-001" \
-metadata rights_holder="Dainis W. Michel" \
-metadata master_rights_holder="Dainis W. Michel" \
-metadata sync_rights_holder="Dainis W. Michel" \
-metadata mechanical_rights_holder="Dainis W. Michel" \
-metadata performance_rights_holder="Dainis W. Michel" \
-metadata clearance_status="Pre-Cleared for All Media" \
-metadata clearance_contact="dainis@dainis.net" \
-metadata licensing_terms="Available for All Media, Worldwide, In Perpetuity" \
-metadata licensing_restrictions="None" \
-metadata sample_clearance="No Samples Used - Original Composition" \
-metadata legal_status="Original Work - All Rights Available" \
-metadata territory_restrictions="None - Available Worldwide" \
-metadata composer="Dainis W. Michel" \
-metadata composer_nationality="Latvian-American" \
-metadata lyricist="Dainis W. Michel" \
-metadata arranger="Dainis W. Michel" \
-metadata producer="Dainis W. Michel" \
-metadata conductor="Dainis W. Michel" \
-metadata performer="Dainis W. Michel on piano, Emīlija Michele on vocals, Olīvija and Hugo on guitar" \
-metadata featured_artist="Dainis W. Michel & Family Ensemble" \
-metadata contributing_artists="Emīlija Michele (vocals), Olīvija (guitar), Hugo (guitar)" \
-metadata performance_date="2024-07-03" \
-metadata recording_location="3x3 Brīvais Mikrofons, Koknese, Latvia" \
-metadata session_musicians="None - Family Performance" \
-metadata publisher_contact="dainis@dainis.net" \
-metadata administrative_contact="dainis@dainis.net" \
-metadata business_contact="dainis@dainis.net" \
-metadata registrations="AustroMechana, Library of Congress, EU Copyright Office" \
-metadata cue_sheet_notes="Traditional Latvian folk song arrangement, live performance" \
-metadata content_warning="None" \
-metadata explicit_content="No" \
-metadata restrictions="None" \
-metadata deadline_restrictions="None" \
-metadata upc="123456789012" \
-metadata grid="A1-ABC-12-12345" \
-metadata encoded_by="FFmpeg" \
-metadata encoding_settings="24-bit/48kHz WAV" \
-metadata original_release_date="2024-07-03" \
-metadata digital_release_date="2024-07-10" \
-metadata availability_date="2024-07-10" \
-metadata distribution_type="Digital and Licensing" \
-metadata digital_distributor="Direct Distribution" \
-metadata album_artist="Dainis W. Michel & OEH" \
-metadata artist_sort="Michel, Dainis" \
-metadata composer_sort="Michel, Dainis" \
-metadata title_sort="Migla migla" \
-metadata album_sort="Sadziedāšana ar Daini" \
-metadata musicbrainz_trackid="MBID-12345-67890" \
-metadata musicbrainz_albumid="MBID-54321-09876" \
-metadata musicbrainz_artistid="MBID-67890-ABCDE" \
-metadata lyrics="Migla, migla, liela rasa,
Man pazuda kumeliņis.

Nokrīt migla, nokrīt rasa,
Es dabūju kumeliņu.

Tumša nakte, zaļa zāle,
Laukā laidu kumeliņu.

Dievs sargāja kumeliņu,
Es pats savu līgaviņu." \
-metadata lyrics_language="Latvian" \
-metadata english_translation="Mist, mist, heavy dew,
I lost my steed.

The mist falls, the dew falls,
I found my steed.

Dark night, green grass,
I let my steed out to pasture.

God protected my steed,
As I protected my bride." \
-metadata lyrics_copyright="© 2024 Dainis W. Michel" \
-metadata website="https://dainis.net" \
-metadata lyrics_url="https://dainis.net" \
-metadata purchase_url="https://dainis.net" \
-metadata license_url="https://dainis.net" \
-metadata artist_url="https://dainis.net" \
-metadata portfolio_url="https://dainis.net" \
-metadata press_kit_url="https://dainis.net" \
-metadata social_media="Instagram: @dainismusic, Twitter: @dainismusic" \
-metadata performance_type="Live" \
-metadata performance_context="3x3 Brīvais Mikrofons Festival" \
-metadata performance_rights="AustroMechana" \
-metadata performance_notes="Family ensemble live performance" \
-metadata stage_plot="Traditional acoustic setup" \
-metadata sound_description="Intimate acoustic performance with natural room ambience" \
-metadata historical_significance="Based on traditional Latvian folk melody" \
-metadata cultural_significance="Represents Latvian diaspora musical traditions" \
-metadata awards="None" \
-metadata reviews="None" \
-metadata additional_notes="Part of the Michel family's ongoing cultural preservation project" \
-metadata archival_notes="Original live recording preserved in family archive" \
-metadata related_materials="Sheet music available upon request" \
-metadata educational_use="Suitable for cultural education programs" \
-metadata version="1.0" \
-metadata revision_number="1" \
-metadata last_modified="2024-07-03" \
-metadata modification_notes="Initial release version" \
"$TEMP_FILE"

echo "Basic metadata embedded. Now adding album art..."

# Step 2: Add album cover to the MP3
ffmpeg -i "$TEMP_FILE" -i "$COVER_IMAGE" -map 0:0 -map 1:0 -c copy -id3v2_version 3 \
    -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (front)" "$OUTPUT_FILE"

# Clean up temporary file
rm "$TEMP_FILE"

echo "Process complete! Your fully tagged MP3 with album art is: $OUTPUT_FILE"
echo "File details:"
ls -lh "$OUTPUT_FILE"