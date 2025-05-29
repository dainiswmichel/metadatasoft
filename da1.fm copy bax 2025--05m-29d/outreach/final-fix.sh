#!/bin/bash

# Final script to fix all outreach post files with hardcoded values for each target

# Fix the Imogen Heap file
cat > "/Users/dainismichel/dainisne/da1.fm/outreach/posts/imogen-heap.html" << 'EOF'
<!DOCTYPE html>
<html lang="en" data-publish-status="draft" data-tweet-status="pending">
<head>
    <!-- Core Meta Tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Outreach to Imogen Heap - DA1</title>
    <meta name="description" content="DA1's outreach to Imogen Heap about digital attribution and creator rights.">
    
    <!-- DA1 Outreach Metadata -->
    <meta name="da1:target" content="Imogen Heap">
    <meta name="da1:target-role" content="Grammy-winning musician and founder of Mycelia (blockchain music rights project)">
    <meta name="da1:target-twitter" content="@imogenheap">
    <meta name="da1:publish-date" content="2025-04-29T21:00:00.000Z">
    <meta name="da1:category" content="Music">
    <meta name="da1:tags" content="Music,Blockchain,Rights,Music">
    
    <!-- Social Media Tags -->
    <meta property="og:title" content="Outreach to Imogen Heap - DA1">
    <meta property="og:description" content="DA1's outreach to Imogen Heap about digital attribution and creator rights.">
    <meta property="og:url" content="https://da1.fm/outreach/posts/imogen-heap.html">
    <meta property="og:type" content="article">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Outreach to Imogen Heap - DA1">
    <meta name="twitter:description" content="DA1's outreach to Imogen Heap about digital attribution and creator rights.">
    
    <!-- CSS Links -->
    <link rel="stylesheet" href="../../resources/icons/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/outreach.css">
    
    <!-- JS Dependencies -->
    <script defer type="module" src="../../js/alpinejs-local.js"></script>
    <script src="../../sidebar.js" defer></script>
</head>
<body>
    <!-- Left Sidebar Container -->
    <div id="left-sidebar-container"></div>

    <!-- Main Content -->
    <div class="main-content">
        <div class="outreach-header">
            <div class="category-tag">Music</div>
            <h1>Outreach to Imogen Heap</h1>
            <div class="outreach-meta">
                <span><i class="bi bi-person"></i> Target: Imogen Heap</span>
                <span><i class="bi bi-briefcase"></i> Grammy-winning musician and founder of Mycelia (blockchain music rights project)</span>
                <span><i class="bi bi-twitter"></i> @imogenheap</span>
                <span><i class="bi bi-calendar3"></i> April 30, 2025</span>
            </div>
        </div>

        <!-- Target Information -->
        <div class="target-info">
            <h2>About Imogen Heap</h2>
            <div class="target-details">
                <p><strong>Role:</strong> <span class="target-role">Grammy-winning musician and founder of Mycelia (blockchain music rights project)</span></p>
                <p><strong>Background:</strong> <span class="target-background">Already has experience with Mycelia project for music rights on blockchain. Demonstrated commitment to solving the exact problems DA1 addresses. Personal story of lost royalties. Actively investing in related technologies.</span></p>
                <p><strong>Quote:</strong> <blockquote class="target-quote">""We need new technical standards that allow creators to embed identity and rights information directly into their work - information that persists across platforms and throughout the content lifecycle.""</blockquote></p>
            </div>
        </div>

        <!-- Personalized Outreach Message -->
        <div class="outreach-message">
            <h2>Personalized Message</h2>
            <p>Dear Imogen, your work in the music space has been inspirational to us at DA1. Your insights about ""We need new technical standards that allow creato..." resonate deeply with our mission.</p>
            <p>At DA1, we've developed a metaMetadata system that ensures attribution data persists throughout the entire digital journey of creative work. Our approach creates a persistent layer of attribution that survives when content travels across platforms that typically strip this data. Given your unique perspective, we believe your insights on our solution would be incredibly valuable.</p>
        </div>
        
        <!-- Tweet Content -->
        <div class="tweet-content">
            <h2>Tweet 1: Verification Tweet</h2>
            <p data-tweet-text="@imogenheap Hi Imogen, did you really say: '"We need new technical standards that allow creators to embed identity and rights information direct...'? Wanted to check...great quote btw...the DA1 team">@imogenheap Hi Imogen, did you really say: '"We need new technical standards that allow creators to embed identity and rights information direct...'? Wanted to check...great quote btw...the DA1 team</p>
            <div class="tweet-status pending">Pending</div>
        </div>
    
        <!-- Tweet 2: Invitation Tweet -->
        <div class="tweet-content">
            <h2>Tweet 2: Invitation Tweet</h2>
            <p data-tweet-text="@imogenheap Your work in the field of music continues to inspire. We're inviting you to ask 'Dawon', our chatbot, anything about DA1metaMetaData here: https://da1.fm/chat.html">@imogenheap Your work in the field of music continues to inspire. We're inviting you to ask 'Dawon', our chatbot, anything about DA1metaMetaData here: https://da1.fm/chat.html</p>
        </div>
        
        <!-- Follow-up Plan -->
        <div class="follow-up-plan">
            <h2>Outreach Plan</h2>
            <ol>
                <li>Check if quote is correct</li>
                <li>Monitor for response</li>
                <li>Thank for excellent work</li>
                <li>Send invitation code to chat</li>
                <li>Collaborate, cooperate, and solve the global metadata crisis — together!</li>
            </ol>
        </div>
        
        <!-- Comments Section -->
        <div class="comments-section">
            <h2>Interactions & Comments</h2>
            <div class="giscus"></div>
        </div>
    </div>

    <!-- Right Sidebar Container -->
    <div id="right-sidebar-container"></div>

    <!-- Footer Container -->
    <div id="footer-container"></div>

    <!-- Scripts -->
    <script src="../js/component-loader.js"></script>
    <script src="../js/outreach-sharing.js"></script>

    <!-- Giscus Comments -->
    <script src="https://giscus.app/client.js"
        data-repo="dainiswmichel/da1-discussions"
        data-repo-id="R_kgDOOnycXg"
        data-category="Announcements"
        data-category-id="DIC_kwDOOnycXs4Cp_zL"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="1"
        data-input-position="bottom"
        data-theme="light"
        data-lang="en"
        crossorigin="anonymous"
        async>
    </script>
</body>
</html>
EOF

# Fix the Justin Blau (3LAU) file
cat > "/Users/dainismichel/dainisne/da1.fm/outreach/posts/justin-blau-3lau.html" << 'EOF'
<!DOCTYPE html>
<html lang="en" data-publish-status="draft" data-tweet-status="pending">
<head>
    <!-- Core Meta Tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Outreach to Justin Blau (3LAU) - DA1</title>
    <meta name="description" content="DA1's outreach to Justin Blau (3LAU) about digital attribution and creator rights.">
    
    <!-- DA1 Outreach Metadata -->
    <meta name="da1:target" content="Justin Blau (3LAU)">
    <meta name="da1:target-role" content="DJ, producer and founder of Royal (music NFT platform)">
    <meta name="da1:target-twitter" content="@3LAU">
    <meta name="da1:publish-date" content="2025-04-18T21:00:00.000Z">
    <meta name="da1:category" content="Music">
    <meta name="da1:tags" content="Music,Nft,Music">
    
    <!-- Social Media Tags -->
    <meta property="og:title" content="Outreach to Justin Blau (3LAU) - DA1">
    <meta property="og:description" content="DA1's outreach to Justin Blau (3LAU) about digital attribution and creator rights.">
    <meta property="og:url" content="https://da1.fm/outreach/posts/justin-blau-3lau.html">
    <meta property="og:type" content="article">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Outreach to Justin Blau (3LAU) - DA1">
    <meta name="twitter:description" content="DA1's outreach to Justin Blau (3LAU) about digital attribution and creator rights.">
    
    <!-- CSS Links -->
    <link rel="stylesheet" href="../../resources/icons/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/outreach.css">
    
    <!-- JS Dependencies -->
    <script defer type="module" src="../../js/alpinejs-local.js"></script>
    <script src="../../sidebar.js" defer></script>
</head>
<body>
    <!-- Left Sidebar Container -->
    <div id="left-sidebar-container"></div>

    <!-- Main Content -->
    <div class="main-content">
        <div class="outreach-header">
            <div class="category-tag">Music</div>
            <h1>Outreach to Justin Blau (3LAU)</h1>
            <div class="outreach-meta">
                <span><i class="bi bi-person"></i> Target: Justin Blau (3LAU)</span>
                <span><i class="bi bi-briefcase"></i> DJ, producer and founder of Royal (music NFT platform)</span>
                <span><i class="bi bi-twitter"></i> @3LAU</span>
                <span><i class="bi bi-calendar3"></i> April 19, 2025</span>
            </div>
        </div>

        <!-- Target Information -->
        <div class="target-info">
            <h2>About Justin Blau (3LAU)</h2>
            <div class="target-details">
                <p><strong>Role:</strong> <span class="target-role">DJ, producer and founder of Royal (music NFT platform)</span></p>
                <p><strong>Background:</strong> <span class="target-background">Already built and received funding for Royal, which focuses on music rights through NFTs. Has deep understanding of the problem space. Significant investor connections. Potential for integrating DA1 technology with Royal.</span></p>
                <p><strong>Quote:</strong> <blockquote class="target-quote">""The future of music is giving artists the ability to capture the value they create, and connecting their work directly to their identity across the entire digital ecosystem.""</blockquote></p>
            </div>
        </div>

        <!-- Personalized Outreach Message -->
        <div class="outreach-message">
            <h2>Personalized Message</h2>
            <p>Dear Justin, your work in the music space has been inspirational to us at DA1. Your insights about ""The future of music is giving artists the ability..." resonate deeply with our mission.</p>
            <p>At DA1, we've developed a metaMetadata system that ensures attribution data persists throughout the entire digital journey of creative work. Our approach creates a persistent layer of attribution that survives when content travels across platforms that typically strip this data. Given your unique perspective, we believe your insights on our solution would be incredibly valuable.</p>
        </div>
        
        <!-- Tweet Content -->
        <div class="tweet-content">
            <h2>Tweet 1: Verification Tweet</h2>
            <p data-tweet-text="@3LAU Hi Justin, did you really say: '"The future of music is giving artists the ability to capture the value they create, and connecting ...'? Wanted to check...great quote btw...the DA1 team">@3LAU Hi Justin, did you really say: '"The future of music is giving artists the ability to capture the value they create, and connecting ...'? Wanted to check...great quote btw...the DA1 team</p>
            <div class="tweet-status pending">Pending</div>
        </div>
    
        <!-- Tweet 2: Invitation Tweet -->
        <div class="tweet-content">
            <h2>Tweet 2: Invitation Tweet</h2>
            <p data-tweet-text="@3LAU Your work in the field of music continues to inspire. We're inviting you to ask 'Dawon', our chatbot, anything about DA1metaMetaData here: https://da1.fm/chat.html">@3LAU Your work in the field of music continues to inspire. We're inviting you to ask 'Dawon', our chatbot, anything about DA1metaMetaData here: https://da1.fm/chat.html</p>
        </div>
        
        <!-- Follow-up Plan -->
        <div class="follow-up-plan">
            <h2>Outreach Plan</h2>
            <ol>
                <li>Check if quote is correct</li>
                <li>Monitor for response</li>
                <li>Thank for excellent work</li>
                <li>Send invitation code to chat</li>
                <li>Collaborate, cooperate, and solve the global metadata crisis — together!</li>
            </ol>
        </div>
        
        <!-- Comments Section -->
        <div class="comments-section">
            <h2>Interactions & Comments</h2>
            <div class="giscus"></div>
        </div>
    </div>

    <!-- Right Sidebar Container -->
    <div id="right-sidebar-container"></div>

    <!-- Footer Container -->
    <div id="footer-container"></div>

    <!-- Scripts -->
    <script src="../js/component-loader.js"></script>
    <script src="../js/outreach-sharing.js"></script>

    <!-- Giscus Comments -->
    <script src="https://giscus.app/client.js"
        data-repo="dainiswmichel/da1-discussions"
        data-repo-id="R_kgDOOnycXg"
        data-category="Announcements"
        data-category-id="DIC_kwDOOnycXs4Cp_zL"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="1"
        data-input-position="bottom"
        data-theme="light"
        data-lang="en"
        crossorigin="anonymous"
        async>
    </script>
</body>
</html>
EOF

# Fix the RAC file
cat > "/Users/dainismichel/dainisne/da1.fm/outreach/posts/rac-andr-allen-anjos.html" << 'EOF'
<!DOCTYPE html>
<html lang="en" data-publish-status="draft" data-tweet-status="pending">
<head>
    <!-- Core Meta Tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Outreach to RAC (André Allen Anjos) - DA1</title>
    <meta name="description" content="DA1's outreach to RAC (André Allen Anjos) about digital attribution and creator rights.">
    
    <!-- DA1 Outreach Metadata -->
    <meta name="da1:target" content="RAC (André Allen Anjos)">
    <meta name="da1:target-role" content="Grammy-winning producer, musician and NFT pioneer">
    <meta name="da1:target-twitter" content="@RAC">
    <meta name="da1:publish-date" content="2025-05-03T21:00:00.000Z">
    <meta name="da1:category" content="Music">
    <meta name="da1:tags" content="Music,Nft,Music">
    
    <!-- Social Media Tags -->
    <meta property="og:title" content="Outreach to RAC (André Allen Anjos) - DA1">
    <meta property="og:description" content="DA1's outreach to RAC (André Allen Anjos) about digital attribution and creator rights.">
    <meta property="og:url" content="https://da1.fm/outreach/posts/rac-andr-allen-anjos.html">
    <meta property="og:type" content="article">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Outreach to RAC (André Allen Anjos) - DA1">
    <meta name="twitter:description" content="DA1's outreach to RAC (André Allen Anjos) about digital attribution and creator rights.">
    
    <!-- CSS Links -->
    <link rel="stylesheet" href="../../resources/icons/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/outreach.css">
    
    <!-- JS Dependencies -->
    <script defer type="module" src="../../js/alpinejs-local.js"></script>
    <script src="../../sidebar.js" defer></script>
</head>
<body>
    <!-- Left Sidebar Container -->
    <div id="left-sidebar-container"></div>

    <!-- Main Content -->
    <div class="main-content">
        <div class="outreach-header">
            <div class="category-tag">Music</div>
            <h1>Outreach to RAC (André Allen Anjos)</h1>
            <div class="outreach-meta">
                <span><i class="bi bi-person"></i> Target: RAC (André Allen Anjos)</span>
                <span><i class="bi bi-briefcase"></i> Grammy-winning producer, musician and NFT pioneer</span>
                <span><i class="bi bi-twitter"></i> @RAC</span>
                <span><i class="bi bi-calendar3"></i> May 4, 2025</span>
            </div>
        </div>

        <!-- Target Information -->
        <div class="target-info">
            <h2>About RAC (André Allen Anjos)</h2>
            <div class="target-details">
                <p><strong>Role:</strong> <span class="target-role">Grammy-winning producer, musician and NFT pioneer</span></p>
                <p><strong>Background:</strong> <span class="target-background">Highly active in music tech innovation, especially Web3. Has launched successful NFT projects. Demonstrated interest in royalty systems and music rights. Has technical background and understanding.</span></p>
                <p><strong>Quote:</strong> <blockquote class="target-quote">""The bridge between traditional music rights systems and Web3 is the missing piece. We need solutions that bring these worlds together rather than forcing artists to choose sides.""</blockquote></p>
            </div>
        </div>

        <!-- Personalized Outreach Message -->
        <div class="outreach-message">
            <h2>Personalized Message</h2>
            <p>Dear RAC, your work in the music space has been inspirational to us at DA1. Your insights about ""The bridge between traditional music rights syste..." resonate deeply with our mission.</p>
            <p>At DA1, we've developed a metaMetadata system that ensures attribution data persists throughout the entire digital journey of creative work. Our approach creates a persistent layer of attribution that survives when content travels across platforms that typically strip this data. Given your unique perspective, we believe your insights on our solution would be incredibly valuable.</p>
        </div>
        
        <!-- Tweet Content -->
        <div class="tweet-content">
            <h2>Tweet 1: Verification Tweet</h2>
            <p data-tweet-text="@RAC Hi RAC, did you really say: '"The bridge between traditional music rights systems and Web3 is the missing piece. We need solution...'? Wanted to check...great quote btw...the DA1 team">@RAC Hi RAC, did you really say: '"The bridge between traditional music rights systems and Web3 is the missing piece. We need solution...'? Wanted to check...great quote btw...the DA1 team</p>
            <div class="tweet-status pending">Pending</div>
        </div>
    
        <!-- Tweet 2: Invitation Tweet -->
        <div class="tweet-content">
            <h2>Tweet 2: Invitation Tweet</h2>
            <p data-tweet-text="@RAC Your work in the field of music continues to inspire. We're inviting you to ask 'Dawon', our chatbot, anything about DA1metaMetaData here: https://da1.fm/chat.html">@RAC Your work in the field of music continues to inspire. We're inviting you to ask 'Dawon', our chatbot, anything about DA1metaMetaData here: https://da1.fm/chat.html</p>
        </div>
        
        <!-- Follow-up Plan -->
        <div class="follow-up-plan">
            <h2>Outreach Plan</h2>
            <ol>
                <li>Check if quote is correct</li>
                <li>Monitor for response</li>
                <li>Thank for excellent work</li>
                <li>Send invitation code to chat</li>
                <li>Collaborate, cooperate, and solve the global metadata crisis — together!</li>
            </ol>
        </div>
        
        <!-- Comments Section -->
        <div class="comments-section">
            <h2>Interactions & Comments</h2>
            <div class="giscus"></div>
        </div>
    </div>

    <!-- Right Sidebar Container -->
    <div id="right-sidebar-container"></div>

    <!-- Footer Container -->
    <div id="footer-container"></div>

    <!-- Scripts -->
    <script src="../js/component-loader.js"></script>
    <script src="../js/outreach-sharing.js"></script>

    <!-- Giscus Comments -->
    <script src="https://giscus.app/client.js"
        data-repo="dainiswmichel/da1-discussions"
        data-repo-id="R_kgDOOnycXg"
        data-category="Announcements"
        data-category-id="DIC_kwDOOnycXs4Cp_zL"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="1"
        data-input-position="bottom"
        data-theme="light"
        data-lang="en"
        crossorigin="anonymous"
        async>
    </script>
</body>
</html>
EOF

# Fix the Richie Hawtin file
cat > "/Users/dainismichel/dainisne/da1.fm/outreach/posts/richie-hawtin.html" << 'EOF'
<!DOCTYPE html>
<html lang="en" data-publish-status="draft" data-tweet-status="pending">
<head>
    <!-- Core Meta Tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Outreach to Richie Hawtin - DA1</title>
    <meta name="description" content="DA1's outreach to Richie Hawtin about digital attribution and creator rights.">
    
    <!-- DA1 Outreach Metadata -->
    <meta name="da1:target" content="Richie Hawtin">
    <meta name="da1:target-role" content="DJ, producer, founder of Plus 8 Records and technology entrepreneur">
    <meta name="da1:target-twitter" content="@richiehawtin">
    <meta name="da1:publish-date" content="2025-04-22T21:00:00.000Z">
    <meta name="da1:category" content="Technology">
    <meta name="da1:tags" content="Technology">
    
    <!-- Social Media Tags -->
    <meta property="og:title" content="Outreach to Richie Hawtin - DA1">
    <meta property="og:description" content="DA1's outreach to Richie Hawtin about digital attribution and creator rights.">
    <meta property="og:url" content="https://da1.fm/outreach/posts/richie-hawtin.html">
    <meta property="og:type" content="article">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Outreach to Richie Hawtin - DA1">
    <meta name="twitter:description" content="DA1's outreach to Richie Hawtin about digital attribution and creator rights.">
    
    <!-- CSS Links -->
    <link rel="stylesheet" href="../../resources/icons/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/outreach.css">
    
    <!-- JS Dependencies -->
    <script defer type="module" src="../../js/alpinejs-local.js"></script>
    <script src="../../sidebar.js" defer></script>
</head>
<body>
    <!-- Left Sidebar Container -->
    <div id="left-sidebar-container"></div>

    <!-- Main Content -->
    <div class="main-content">
        <div class="outreach-header">
            <div class="category-tag">Technology</div>
            <h1>Outreach to Richie Hawtin</h1>
            <div class="outreach-meta">
                <span><i class="bi bi-person"></i> Target: Richie Hawtin</span>
                <span><i class="bi bi-briefcase"></i> DJ, producer, founder of Plus 8 Records and technology entrepreneur</span>
                <span><i class="bi bi-twitter"></i> @richiehawtin</span>
                <span><i class="bi bi-calendar3"></i> April 23, 2025</span>
            </div>
        </div>

        <!-- Target Information -->
        <div class="target-info">
            <h2>About Richie Hawtin</h2>
            <div class="target-details">
                <p><strong>Role:</strong> <span class="target-role">DJ, producer, founder of Plus 8 Records and technology entrepreneur</span></p>
                <p><strong>Background:</strong> <span class="target-background">Deep history of music technology innovation. Co-founder of Endlesss music collaboration platform. Investor in multiple music tech startups. Global influence and respected voice in electronic music.</span></p>
                <p><strong>Quote:</strong> <blockquote class="target-quote">""Technology should empower artists to maintain control of their creative identity throughout the entire ecosystem. The current fragmentation works against creators.""</blockquote></p>
            </div>
        </div>

        <!-- Personalized Outreach Message -->
        <div class="outreach-message">
            <h2>Personalized Message</h2>
            <p>Dear Richie, your work in the technology space has been inspirational to us at DA1. Your insights about ""Technology should empower artists to maintain con..." resonate deeply with our mission.</p>
            <p>At DA1, we've developed a metaMetadata system that ensures attribution data persists throughout the entire digital journey of creative work. Our approach creates a persistent layer of attribution that survives when content travels across platforms that typically strip this data. Given your unique perspective, we believe your insights on our solution would be incredibly valuable.</p>
        </div>
        
        <!-- Tweet Content -->
        <div class="tweet-content">
            <h2>Tweet 1: Verification Tweet</h2>
            <p data-tweet-text="@richiehawtin Hi Richie, did you really say: '"Technology should empower artists to maintain control of their creative identity throughout the ent...'? Wanted to check...great quote btw...the DA1 team">@richiehawtin Hi Richie, did you really say: '"Technology should empower artists to maintain control of their creative identity throughout the ent...'? Wanted to check...great quote btw...the DA1 team</p>
            <div class="tweet-status pending">Pending</div>
        </div>
    
        <!-- Tweet 2: Invitation Tweet -->
        <div class="tweet-content">
            <h2>Tweet 2: Invitation Tweet</h2>
            <p data-tweet-text="@richiehawtin Your work in the field of technology continues to inspire. We're inviting you to ask 'Dawon', our chatbot, anything about DA1metaMetaData here: https://da1.fm/chat.html">@richiehawtin Your work in the field of technology continues to inspire. We're inviting you to ask 'Dawon', our chatbot, anything about DA1metaMetaData here: https://da1.fm/chat.html</p>
        </div>
        
        <!-- Follow-up Plan -->
        <div class="follow-up-plan">
            <h2>Outreach Plan</h2>
            <ol>
                <li>Check if quote is correct</li>
                <li>Monitor for response</li>
                <li>Thank for excellent work</li>
                <li>Send invitation code to chat</li>
                <li>Collaborate, cooperate, and solve the global metadata crisis — together!</li>
            </ol>
        </div>
        
        <!-- Comments Section -->
        <div class="comments-section">
            <h2>Interactions & Comments</h2>
            <div class="giscus"></div>
        </div>
    </div>

    <!-- Right Sidebar Container -->
    <div id="right-sidebar-container"></div>

    <!-- Footer Container -->
    <div id="footer-container"></div>

    <!-- Scripts -->
    <script src="../js/component-loader.js"></script>
    <script src="../js/outreach-sharing.js"></script>

    <!-- Giscus Comments -->
    <script src="https://giscus.app/client.js"
        data-repo="dainiswmichel/da1-discussions"
        data-repo-id="R_kgDOOnycXg"
        data-category="Announcements"
        data-category-id="DIC_kwDOOnycXs4Cp_zL"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="1"
        data-input-position="bottom"
        data-theme="light"
        data-lang="en"
        crossorigin="anonymous"
        async>
    </script>
</body>
</html>
EOF

# Fix the Zoe Keating file
cat > "/Users/dainismichel/dainisne/da1.fm/outreach/posts/zo-keating.html" << 'EOF'
<!DOCTYPE html>
<html lang="en" data-publish-status="draft" data-tweet-status="pending">
<head>
    <!-- Core Meta Tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Outreach to Zoë Keating - DA1</title>
    <meta name="description" content="DA1's outreach to Zoë Keating about digital attribution and creator rights.">
    
    <!-- DA1 Outreach Metadata -->
    <meta name="da1:target" content="Zoë Keating">
    <meta name="da1:target-role" content="Independent cellist, composer, and leading voice on music metadata & artist rights">
    <meta name="da1:target-twitter" content="@zoecello">
    <meta name="da1:publish-date" content="2025-04-29T21:00:00.000Z">
    <meta name="da1:category" content="Music">
    <meta name="da1:tags" content="Music,Rights,Metadata,Music,Art">
    
    <!-- Social Media Tags -->
    <meta property="og:title" content="Outreach to Zoë Keating - DA1">
    <meta property="og:description" content="DA1's outreach to Zoë Keating about digital attribution and creator rights.">
    <meta property="og:url" content="https://da1.fm/outreach/posts/zo-keating.html">
    <meta property="og:type" content="article">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Outreach to Zoë Keating - DA1">
    <meta name="twitter:description" content="DA1's outreach to Zoë Keating about digital attribution and creator rights.">
    
    <!-- CSS Links -->
    <link rel="stylesheet" href="../../resources/icons/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/outreach.css">
    
    <!-- JS Dependencies -->
    <script defer type="module" src="../../js/alpinejs-local.js"></script>
    <script src="../../sidebar.js" defer></script>
</head>
<body>
    <!-- Left Sidebar Container -->
    <div id="left-sidebar-container"></div>

    <!-- Main Content -->
    <div class="main-content">
        <div class="outreach-header">
            <div class="category-tag">Music</div>
            <h1>Outreach to Zoë Keating</h1>
            <div class="outreach-meta">
                <span><i class="bi bi-person"></i> Target: Zoë Keating</span>
                <span><i class="bi bi-briefcase"></i> Independent cellist, composer, and leading voice on music metadata & artist rights</span>
                <span><i class="bi bi-twitter"></i> @zoecello</span>
                <span><i class="bi bi-calendar3"></i> April 30, 2025</span>
            </div>
        </div>

        <!-- Target Information -->
        <div class="target-info">
            <h2>About Zoë Keating</h2>
            <div class="target-details">
                <p><strong>Role:</strong> <span class="target-role">Independent cellist, composer, and leading voice on music metadata & artist rights</span></p>
                <p><strong>Background:</strong> <span class="target-background">Has publicly discussed metadata problems extensively. Experienced firsthand issues with attribution and royalties. Highly respected independent voice in the music industry with influence among both indie and mainstream artists.</span></p>
                <p><strong>Quote:</strong> <blockquote class="target-quote">""I did everything right with my metadata, and it still got lost. This isn't just about royalties - it's about maintaining the connection between artists and their work.""</blockquote></p>
            </div>
        </div>

        <!-- Personalized Outreach Message -->
        <div class="outreach-message">
            <h2>Personalized Message</h2>
            <p>Dear Zoë, your work in the music space has been inspirational to us at DA1. Your insights about ""I did everything right with my metadata, and it s..." resonate deeply with our mission.</p>
            <p>At DA1, we've developed a metaMetadata system that ensures attribution data persists throughout the entire digital journey of creative work. Our approach creates a persistent layer of attribution that survives when content travels across platforms that typically strip this data. Given your unique perspective, we believe your insights on our solution would be incredibly valuable.</p>
        </div>
        
        <!-- Tweet Content -->
        <div class="tweet-content">
            <h2>Tweet 1: Verification Tweet</h2>
            <p data-tweet-text="@zoecello Hi Zoë, did you really say: '"I did everything right with my metadata, and it still got lost. This isn't just about royalties - i...'? Wanted to check...great quote btw...the DA1 team">@zoecello Hi Zoë, did you really say: '"I did everything right with my metadata, and it still got lost. This isn't just about royalties - i...'? Wanted to check...great quote btw...the DA1 team</p>
            <div class="tweet-status pending">Pending</div>
        </div>
    
        <!-- Tweet 2: Invitation Tweet -->
        <div class="tweet-content">
            <h2>Tweet 2: Invitation Tweet</h2>
            <p data-tweet-text="@zoecello Your work in the field of music continues to inspire. We're inviting you to ask 'Dawon', our chatbot, anything about DA1metaMetaData here: https://da1.fm/chat.html">@zoecello Your work in the field of music continues to inspire. We're inviting you to ask 'Dawon', our chatbot, anything about DA1metaMetaData here: https://da1.fm/chat.html</p>
        </div>
        
        <!-- Follow-up Plan -->
        <div class="follow-up-plan">
            <h2>Outreach Plan</h2>
            <ol>
                <li>Check if quote is correct</li>
                <li>Monitor for response</li>
                <li>Thank for excellent work</li>
                <li>Send invitation code to chat</li>
                <li>Collaborate, cooperate, and solve the global metadata crisis — together!</li>
            </ol>
        </div>
        
        <!-- Comments Section -->
        <div class="comments-section">
            <h2>Interactions & Comments</h2>
            <div class="giscus"></div>
        </div>
    </div>

    <!-- Right Sidebar Container -->
    <div id="right-sidebar-container"></div>

    <!-- Footer Container -->
    <div id="footer-container"></div>

    <!-- Scripts -->
    <script src="../js/component-loader.js"></script>
    <script src="../js/outreach-sharing.js"></script>

    <!-- Giscus Comments -->
    <script src="https://giscus.app/client.js"
        data-repo="dainiswmichel/da1-discussions"
        data-repo-id="R_kgDOOnycXg"
        data-category="Announcements"
        data-category-id="DIC_kwDOOnycXs4Cp_zL"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="1"
        data-input-position="bottom"
        data-theme="light"
        data-lang="en"
        crossorigin="anonymous"
        async>
    </script>
</body>
</html>
EOF

echo "All files have been completely rebuilt with the correct content!"