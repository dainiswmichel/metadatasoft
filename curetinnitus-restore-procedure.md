# Procedure to Restore CureTinnitus.org Website

## Phase 1: Clear the CureTinnitus.org Directory on the Server
```bash
# SSH into your server
ssh chemicloud

# Go to the parent directory
cd /home/dainisne/

# Remove all current content from the curetinnitus.org directory
rm -rf curetinnitus.org/*

# Verify it's empty
ls -la curetinnitus.org/
```

## Phase 2: Upload the Backup File to the Server
```bash
# From your local machine, upload the backup
scp /Users/dainismichel/2025/curetinnitus.org/backup-curetinnitus.org-20230918-psfhfbunjgtfdrmc.zip chemicloud:/home/dainisne/
```

## Phase 3: Extract the Backup and Set Permissions
```bash
# SSH back into the server if needed
ssh chemicloud

# Go to your home directory
cd /home/dainisne/

# Verify backup file is uploaded
ls -lh backup-curetinnitus.org-20230918-psfhfbunjgtfdrmc.zip

# Extract the backup directly into the curetinnitus.org directory
unzip backup-curetinnitus.org-20230918-psfhfbunjgtfdrmc.zip -d curetinnitus.org

# Set proper permissions
find curetinnitus.org -type d -exec chmod 755 {} \;
find curetinnitus.org -type f -exec chmod 644 {} \;
chmod 444 curetinnitus.org/.htaccess 2>/dev/null  # If it exists
```

## Phase 4: Restore Database (if included in backup)
```bash
# Look for SQL files in the extracted backup
find curetinnitus.org -name "*.sql"

# If SQL file is found, check database credentials in wp-config.php
grep DB_ curetinnitus.org/wp-config.php

# Replace these variables with actual values from wp-config.php
DB_USER=$(grep DB_USER curetinnitus.org/wp-config.php | cut -d "'" -f 4)
DB_NAME=$(grep DB_NAME curetinnitus.org/wp-config.php | cut -d "'" -f 4)
DB_PASSWORD=$(grep DB_PASSWORD curetinnitus.org/wp-config.php | cut -d "'" -f 4)

# Path to SQL file found in the previous step
SQL_FILE="path/to/found/sql/file.sql"

# Import the database
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < $SQL_FILE
```

## Phase 5: Verify Installation and Update Site URL if Needed
```bash
# Verify WordPress files
ls -la curetinnitus.org/wp-admin
ls -la curetinnitus.org/wp-content
ls -la curetinnitus.org/wp-includes

# Update site URL in database if needed
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "UPDATE wp_options SET option_value = 'https://curetinnitus.org' WHERE option_name IN ('siteurl', 'home');"
```

## Phase 6: Cleanup
```bash
# Remove the backup ZIP to save space (optional)
rm /home/dainisne/backup-curetinnitus.org-20230918-psfhfbunjgtfdrmc.zip
```

Visit https://curetinnitus.org to verify the site is working correctly.