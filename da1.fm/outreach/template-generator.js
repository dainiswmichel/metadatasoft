// Outreach HTML file generator for DA1.fm
// This script generates outreach HTML files for 50 contacts
// To be released 2 per day from May 5 through May 31, 2025

// Contact data
const contacts = [
  {
    name: "Steve Aoki",
    role: "DJ, producer, music executive and NFT collector/creator",
    twitter: "@steveaoki",
    background: "Very active in Web3 and NFT space. Founded Dim Mak record label. Investor in multiple tech startups. Massive platform and influence. Connections to major artists and label executives.",
    quote: "The intersection of music, technology, and ownership is fundamentally changing how artists connect with fans. Blockchain and proper attribution systems are essential for this new era of creator empowerment.",
    category: "Music",
    tags: "Music,NFT,Producer,Web3"
  },
  {
    name: "deadmau5 (Joel Zimmerman)",
    role: "Electronic music producer, technologist, and crypto enthusiast",
    twitter: "@deadmau5",
    background: "Deep technical knowledge and interest in music technology. Founded music tech startup Splice. Active in crypto and NFT spaces. Influence among electronic music producers and technologists.",
    quote: "The music industry has been plagued by attribution and rights management issues for decades. The solution isn't just blockchain - it's a complete rethinking of how metadata moves through the ecosystem.",
    category: "Music",
    tags: "Music,NFT,Producer,Technology"
  },
  {
    name: "Illmind (Ramon Ibanga Jr.)",
    role: "Grammy-winning producer, sample pack creator, NFT pioneer",
    twitter: "@illmind",
    background: "Pioneer in selling samples as NFTs. Built the BLAP:SAMPLEPACK brand. Extensive network in production community. Experience with rights management for samples. Potential integration with his sample marketplace.",
    quote: "For sample-based producers, proper attribution and rights management isn't just about getting paid - it's about building on each other's creativity in a sustainable way that respects the entire chain of creation.",
    category: "Music",
    tags: "Music,Producer,Samples,NFT"
  },
  {
    name: "Trey Ratcliff",
    role: "World-renowned travel photographer who's been vocal about image rights",
    twitter: "@TreyRatcliff",
    background: "Has publicly discussed issues with image rights and attribution. Massive following in photography community. Early adopter of new technologies for creators. Potential case study showing DA1's impact on photography.",
    quote: "When platforms strip metadata from our images, they're not just removing information - they're severing the connection between creators and their work. This has massive economic and cultural consequences.",
    category: "Photography",
    tags: "Photography,Visual,Rights,Attribution"
  },
  {
    name: "Chase Jarvis",
    role: "Photographer, director and founder of CreativeLive",
    twitter: "@chasejarvis",
    background: "Founder of CreativeLive education platform. Influential voice for creators' rights. Strong business acumen and connections to creative industries. Potential integration with CreativeLive for educational content.",
    quote: "The gap in creator education around metadata and attribution is staggering. Most creators don't realize how much revenue and opportunity they're losing due to stripped metadata.",
    category: "Photography",
    tags: "Photography,Education,Visual,CreativeLive"
  },
  {
    name: "Annie Leibovitz",
    role: "Legendary portrait photographer with strong interest in digital rights",
    twitter: "@annieleibovitz",
    background: "Extremely high-profile photographer whose work is frequently shared without attribution. History of interest in digital rights. Connection would bring significant industry credibility.",
    quote: "The digital environment has created unprecedented challenges for visual artists. We need technological solutions that preserve the connection between artists and their work across the entire digital ecosystem.",
    category: "Photography",
    tags: "Photography,Visual,Portraits,Rights"
  },
  {
    name: "Casey Neistat",
    role: "Filmmaker, YouTube pioneer and technology entrepreneur",
    twitter: "@Casey",
    background: "Massive audience and influence among content creators. Early technology adopter. Founded creative community 368. Potential for creating educational content about DA1.",
    quote: "The creator economy is built on attribution, but the tools for maintaining that attribution are fundamentally broken. We're building massive platforms on a foundation that can't support the weight.",
    category: "Video",
    tags: "Video,YouTube,Creator,Filmmaker"
  },
  {
    name: "Peter McKinnon",
    role: "Photographer, filmmaker and YouTube educator",
    twitter: "@petermckinnon",
    background: "Massive photography/filmmaking audience with 5M+ YouTube subscribers. Educational focus aligns with need for metadata awareness. Entrepreneurial background with product launches. Potential educational partnership.",
    quote: "The technical aspects of metadata and attribution aren't sexy topics, but they're absolutely essential for creators to understand if they want to protect their work and their livelihood.",
    category: "Photography",
    tags: "Photography,Video,YouTube,Education"
  },
  {
    name: "Daniel Ek",
    role: "CEO and Founder of Spotify",
    twitter: "@eldsjal",
    background: "Decision-maker at world's largest music streaming platform. Has spoken about need for better metadata. Controls platform that could implement DA1 technology at massive scale. Strategic investor in music technologies.",
    quote: "Solving the metadata crisis in music isn't just good for creators - it's essential for platforms like Spotify to build sustainable ecosystems where value flows to the right people.",
    category: "Music",
    tags: "Music,Platform,Streaming,Business"
  },
  {
    name: "Troy Carter",
    role: "Music executive, former Spotify executive, founder of Q&A and Atom Factory",
    twitter: "@troycarter",
    background: "Extensive experience in music industry technology. Former Spotify executive focused on creator relations. Active investor in music tech startups. Deep connections throughout industry.",
    quote: "The music industry's metadata problem is costing artists billions in lost revenue. Any solution that fixes this problem isn't just good for creators - it's good business.",
    category: "Music",
    tags: "Music,Business,Investment,Executive"
  },
  {
    name: "Ghazi Shami",
    role: "Founder and CEO of Empire Distribution",
    twitter: "@ghazi",
    background: "Forward-thinking distribution company with strong tech focus. Works with both major and independent artists. Potential to implement DA1 across their entire catalog. Pioneer in rights management technologies.",
    quote: "Independent artists and labels need metadata solutions that work at scale without requiring technical expertise. The platforms that solve this problem will win the next decade of music distribution.",
    category: "Music",
    tags: "Music,Distribution,Business,Independent"
  },
  {
    name: "Michael Weissman",
    role: "CEO of SoundCloud",
    twitter: "@mweissman",
    background: "Leads platform focused on emerging artists. Strong interest in creator tools and services. Potential to integrate DA1 technology into SoundCloud's creator ecosystem. Platform actively seeking differentiators.",
    quote: "The next generation of music platforms must be built with creator attribution and rights management as fundamental principles, not afterthoughts.",
    category: "Music",
    tags: "Music,Platform,Streaming,Technology"
  },
  {
    name: "Sam Wick",
    role: "Head of UTA Ventures (United Talent Agency)",
    twitter: "@samwick",
    background: "Active investor in creator economy startups. Access to major artists through UTA. Understanding of both technology and entertainment industries. Strategic advisor to portfolio companies.",
    quote: "Talent agencies recognize that attribution technology isn't just a technical issue - it's a fundamental business concern for every artist we represent.",
    category: "Business",
    tags: "Business,Investment,Entertainment,Agency"
  },
  {
    name: "Fred Wilson",
    role: "Co-founder and Partner at Union Square Ventures",
    twitter: "@fredwilson",
    background: "Early investor in SoundCloud, Kickstarter, and Twitter. Deep understanding of Web3. Strong interest in creator economy. Portfolio synergies with multiple USV companies.",
    quote: "The creator economy needs infrastructure that seamlessly bridges Web2 and Web3, creating a continuous attribution layer that follows content wherever it goes.",
    category: "Investment",
    tags: "Investment,Venture,Web3,Technology"
  },
  {
    name: "Jesse Walden",
    role: "Founder of Variant Fund, former Co-founder of Mediachain (metadata protocol acquired by Spotify)",
    twitter: "@jessewldn",
    background: "Directly relevant experience with Mediachain (metadata protocol). Deep understanding of the problem space. Strong Web3 investment focus. Previous exit to Spotify in related technology.",
    quote: "We built Mediachain to solve the metadata crisis in music, but the problem extends across all creative industries. What's needed is a cross-media solution that works with existing standards.",
    category: "Investment",
    tags: "Investment,Web3,Music,Metadata"
  },
  {
    name: "Kevin Rose",
    role: "Partner at True Ventures, Web3 entrepreneur, founder of Proof Collective",
    twitter: "@kevinrose",
    background: "Strong interest in NFTs and digital provenance. Host of popular podcast with relevant audience. Connection to technology investors. Experience with Web3 product development and communities.",
    quote: "The most valuable part of an NFT isn't the image - it's the metadata that creates verifiable provenance and attribution. This is the foundation of all digital value.",
    category: "Investment",
    tags: "Investment,NFT,Web3,Technology"
  },
  {
    name: "Li Jin",
    role: "Founder of Atelier Ventures, focused on creator economy",
    twitter: "@ljin18",
    background: "Specialist investor in creator economy. Former Andreessen Horowitz partner. Thought leader on creator monetization and ownership. Access to network of creator-focused startups.",
    quote: "For the creator economy to truly benefit creators, we need to solve the attribution problem. Without reliable metadata, value cannot flow properly to the people who create it.",
    category: "Investment",
    tags: "Investment,Creator,Economy,Business"
  },
  {
    name: "Chris Dixon",
    role: "Partner at Andreessen Horowitz, leading a16z Crypto",
    twitter: "@cdixon",
    background: "Leading voice in Web3. Massive investment capability. Strong thesis alignment with DA1. Portfolio companies could be integration partners. Thought leadership platform for industry awareness.",
    quote: "Web3 is fundamentally about putting control and value back in the hands of creators and users. Attribution systems that work across both traditional and blockchain platforms are essential for this transition.",
    category: "Investment",
    tags: "Investment,Web3,Crypto,Venture"
  },
  {
    name: "Mitch Lasky",
    role: "General Partner at Benchmark Capital",
    twitter: "@mitchlasky",
    background: "Extensive experience in digital media investments. Led investment in Riot Games and Snap. Understanding of content ecosystem dynamics. Strong connections throughout entertainment industry.",
    quote: "Content attribution is one of the most significant unsolved problems in the digital economy. The companies that solve it will create immense value for both creators and platforms.",
    category: "Investment",
    tags: "Investment,Gaming,Media,Venture"
  },
  {
    name: "Mark Cuban",
    role: "Entrepreneur, investor, Shark Tank personality, Dallas Mavericks owner",
    twitter: "@mcuban",
    background: "Active investor in Web3 and NFT space. High public profile for credibility and exposure. Has publicly discussed metadata challenges. Multiple relevant portfolio companies.",
    quote: "The metadata problem in creative industries isn't just an academic issue - it's costing creators billions in lost revenue and opportunities. Solving it creates a massive business opportunity.",
    category: "Investment",
    tags: "Investment,Entrepreneur,Sports,Web3"
  },
  {
    name: "Alexis Ohanian",
    role: "Co-founder of Reddit, founder of Seven Seven Six venture fund",
    twitter: "@alexisohanian",
    background: "Strong focus on community-building technologies. Active in Web3 investments. Major advocate for creator rights. Built Reddit, which could be adoption channel. Married to Serena Williams (potential additional connection).",
    quote: "When we built Reddit, we understood the importance of attribution in community building. Today's creator economy needs technical solutions that scale this concept across the entire digital landscape.",
    category: "Investment",
    tags: "Investment,Reddit,Community,Web3"
  },
  {
    name: "Packy McCormick",
    role: "Writer of Not Boring newsletter, angel investor",
    twitter: "@packyM",
    background: "Influential voice in tech and crypto investment. Large audience through newsletter. Angel investor with strong network. Potential for in-depth analysis of DA1 to attract other investors.",
    quote: "The attribution layer of the internet has been fundamentally broken since day one. Fixing it isn't just good for creators - it's essential infrastructure for the entire digital economy.",
    category: "Investment",
    tags: "Investment,Newsletter,Analysis,Web3"
  },
  {
    name: "Balaji Srinivasan",
    role: "Angel investor, entrepreneur, former CTO of Coinbase, former General Partner at a16z",
    twitter: "@balajis",
    background: "Deep technical expertise in blockchain. Strong thesis alignment with decentralized creator ownership. Influential voice in tech circles. Extensive network of crypto investors and entrepreneurs.",
    quote: "Reliable metadata and attribution is the foundation of digital property rights. Without solving this problem, we can't build a truly functional digital economy.",
    category: "Investment",
    tags: "Investment,Crypto,Technology,Entrepreneur"
  },
  {
    name: "Jeff Price",
    role: "Founder of Audiam, TuneCore and SpinArt Records",
    twitter: "@jeffprice",
    background: "Pioneer in digital music distribution and rights management. Deep understanding of music metadata challenges. Built multiple successful music tech companies. Strong industry connections and credibility.",
    quote: "The music industry loses billions every year due to poor metadata. This isn't a technical problem - it's an existential threat to the entire creative ecosystem.",
    category: "Music",
    tags: "Music,Rights,Distribution,Business"
  },
  {
    name: "Vickie Nauman",
    role: "Founder of CrossBorderWorks, music tech consultant, former executive at 7digital",
    twitter: "@vickienauman",
    background: "Extensive experience in music licensing and metadata. Advises major music tech companies. Global perspective on digital music rights. Strong industry connections and reputation as thought leader.",
    quote: "The fragmentation of metadata standards across different industries and platforms is the root cause of our attribution crisis. We need bridges between these systems, not more walled gardens.",
    category: "Music",
    tags: "Music,Consulting,Rights,International"
  },
  {
    name: "Jim Griffin",
    role: "Managing Director of OneHouse LLC, digital music industry pioneer",
    twitter: "@jimgriffin",
    background: "Pioneer in digital music rights. Former executive at Geffen Records and Warner Music. Recognized thought leader on music metadata and rights. Strong connections throughout the industry.",
    quote: "Attribution is the foundation of all creative economies. When we fail to maintain the connection between creators and their work, we're destroying the basis of cultural value.",
    category: "Music",
    tags: "Music,Rights,Pioneer,Industry"
  },
  {
    name: "Allen Bargfrede",
    role: "Executive Director at Rethink Music (Berklee College of Music)",
    twitter: "@allenbargfrede",
    background: "Leading academic research on music industry technology. Published influential papers on music metadata. Connection to Berklee College of Music ecosystem. Educational partnership potential.",
    quote: "The music industry's approach to metadata has been fundamentally flawed from the beginning. We need to rethink how we connect works to creators across the entire digital ecosystem.",
    category: "Music",
    tags: "Music,Education,Academic,Research"
  },
  {
    name: "Panos A. Panay",
    role: "Co-President of Recording Academy, former VP of Innovation at Berklee College of Music",
    twitter: "@panospanay",
    background: "Leadership position at Recording Academy gives industry-wide influence. Founded music tech startups. Advocate for creator rights and technology innovation. Potential for Grammy-level recognition and adoption.",
    quote: "The Recording Academy recognizes that creator attribution isn't just a technical issue - it's a fundamental value that we must protect through both policy and technology.",
    category: "Music",
    tags: "Music,Grammy,Institution,Innovation"
  },
  {
    name: "Gary Vaynerchuk",
    role: "CEO of VaynerMedia, entrepreneur, NFT creator & investor",
    twitter: "@garyvee",
    background: "Massive following and promotional reach. Active investor in creator economy. Creator of VeeFriends NFT project. Connections to major brands and celebrities. Strong focus on creator empowerment.",
    quote: "NFTs are just the beginning of the creator attribution revolution. The next phase will connect traditional content with blockchain verification in a seamless ecosystem.",
    category: "Business",
    tags: "Entrepreneur,NFT,Marketing,Social"
  },
  {
    name: "Jonah Peretti",
    role: "CEO and co-founder of BuzzFeed",
    twitter: "@peretti",
    background: "Leads major digital media company that would benefit from better attribution. Connected to media industry investors. Forward-thinking on content technology. BuzzFeed could be major implementation partner.",
    quote: "The viral nature of content on the internet has completely broken traditional attribution systems. Media companies need technology that maintains creator connections regardless of how content spreads.",
    category: "Media",
    tags: "Media,Publishing,Digital,Content"
  },
  {
    name: "Ev Williams",
    role: "CEO of Medium, co-founder of Twitter, founder of Obvious Ventures",
    twitter: "@ev",
    background: "Deep experience in publishing platforms. Medium could be implementation partner for written content. Strong interest in creator economy and attribution. Active investor through Obvious Ventures.",
    quote: "The platforms that will succeed in the future are those that respect the connection between creators and their work. Attribution isn't just an ethical issue - it's a business imperative.",
    category: "Media",
    tags: "Media,Platform,Publishing,Entrepreneur"
  },
  {
    name: "Jim Bankoff",
    role: "Chairman and CEO of Vox Media",
    twitter: "@bankoff",
    background: "Leads major digital media company with technology focus. Vox owns technology publications like The Verge. Strong understanding of content ecosystem. Potential for implementation across media properties.",
    quote: "Media companies are caught in a paradox: our content spreads farther than ever, but attribution and creator connections are lost in the process. This undermines the entire publishing model.",
    category: "Media",
    tags: "Media,Publishing,Journalism,Digital"
  },
  {
    name: "Ben Thompson",
    role: "Founder and author of Stratechery",
    twitter: "@benthompson",
    background: "Influential technology analyst with focus on platform dynamics. Audience of tech industry decision-makers. Potential for in-depth analysis that attracts investors and partners. Independent creator himself.",
    quote: "Attribution is fundamentally a systems problem. The technical solutions exist, but we lack the connective infrastructure that bridges different metadata standards and platforms.",
    category: "Media",
    tags: "Media,Analysis,Newsletter,Technology"
  },
  {
    name: "Ted Sarandos",
    role: "Co-CEO and Chief Content Officer at Netflix",
    twitter: "@tedsarandos",
    background: "Decision maker at world's largest streaming platform. Netflix could implement metadata standards at scale. Connection to content creators across film and television. Strategic investor in entertainment technology.",
    quote: "The streaming revolution has disconnected content from its creators in unprecedented ways. The platforms that rebuild these connections will create the most sustainable creative ecosystems.",
    category: "Media",
    tags: "Media,Streaming,Film,Television"
  },
  {
    name: "Jeffrey Katzenberg",
    role: "Co-founder of WndrCo, former CEO of DreamWorks Animation",
    twitter: "@jeffreykatzenberg",
    background: "Major investor in media and technology. Deep entertainment industry connections. Founded and led major studios. Strong interest in media technology innovation. WndrCo actively investing in related spaces.",
    quote: "Animation and visual effects are particularly vulnerable to attribution loss. When creative teams can't get proper credit for their work, the entire industry suffers.",
    category: "Media",
    tags: "Media,Animation,Film,Investment"
  },
  {
    name: "Susan Wojcicki",
    role: "Former CEO of YouTube, current board member and advisor",
    twitter: "@SusanWojcicki",
    background: "Deep understanding of video creator ecosystem. Strong connections to Google/Alphabet. Influential voice in content platform space. Potential advisory role for YouTube integration.",
    quote: "Creator attribution on video platforms isn't just an afterthought - it's essential infrastructure for a sustainable content ecosystem where creators can build careers.",
    category: "Media",
    tags: "Media,YouTube,Video,Platform"
  },
  {
    name: "Ari Emanuel",
    role: "CEO of Endeavor, co-founder of WME Entertainment",
    twitter: "@ariemanuel",
    background: "Represents major creators across entertainment industry. Controls talent agency with massive influence. Experience with technology ventures. Access to high-profile creators for early adoption.",
    quote: "Talent representation fundamentally depends on proper attribution. When the connection between creators and their work breaks down, the entire entertainment industry suffers.",
    category: "Media",
    tags: "Media,Agency,Entertainment,Business"
  },
  {
    name: "Bob Iger",
    role: "Former CEO of Disney, current Executive Chairman",
    twitter: "@RobertIger",
    background: "Major entertainment industry leader. Strong focus on technology and innovation. Disney controls massive content libraries that need attribution. Influential board member at multiple companies.",
    quote: "As content libraries become more valuable in the streaming era, proper attribution and metadata management becomes a critical business concern for media companies.",
    category: "Media",
    tags: "Media,Disney,Executive,Entertainment"
  },
  {
    name: "Tim Sweeney",
    role: "CEO and founder of Epic Games",
    twitter: "@TimSweeneyEpic",
    background: "Visionary leader in gaming and metaverse technology. Strong advocate for creator rights and fair economics. Epic's Unreal Engine could integrate DA1 technology. Leading voice in future of digital content.",
    quote: "The metaverse will require unprecedented interoperability of digital assets and attribution. Without solving the metadata problem, we can't build truly connected digital worlds.",
    category: "Gaming",
    tags: "Gaming,Metaverse,Technology,Unreal"
  },
  {
    name: "Jason Citron",
    role: "CEO and founder of Discord",
    twitter: "@jasoncitron",
    background: "Built major community platform used by creators. Strong understanding of creator needs. Discord could integrate DA1 attribution tools. Platform for community building around DA1 technology.",
    quote: "Community platforms need to support creator attribution at a fundamental level. The connection between creators and their work is the foundation of sustainable digital communities.",
    category: "Technology",
    tags: "Technology,Discord,Community,Platform"
  },
  {
    name: "Emmett Shear",
    role: "Former CEO and co-founder of Twitch, now a venture partner at Y Combinator",
    twitter: "@eshear",
    background: "Deep understanding of content creator economics. Built major streaming platform. Active investor in creator tools. Strong network in gaming and content creation. Experience with attribution challenges.",
    quote: "Live streaming presents unique challenges for attribution. We need systems that can maintain creator connections in real-time, dynamic content environments.",
    category: "Technology",
    tags: "Technology,Streaming,Gaming,Investment"
  },
  {
    name: "Robert Kotick",
    role: "CEO of Activision Blizzard",
    twitter: "@RobertKotick",
    background: "Leads major gaming publisher with interest in digital assets. Activision Blizzard games could implement DA1 technology. Connection to major entertainment brands and franchises. Strategic investor in gaming technology.",
    quote: "Gaming has always struggled with attribution for creative contributions. As games become more connected and social, we need better systems for tracking and recognizing creator contributions.",
    category: "Gaming",
    tags: "Gaming,Business,Franchise,Executive"
  },
  {
    name: "Yat Siu",
    role: "Co-founder and Executive Chairman of Animoca Brands",
    twitter: "@ysiu",
    background: "Pioneer in blockchain gaming and NFTs. Deep Web3 ecosystem connections. Strong focus on digital property rights. Animoca portfolio companies could integrate DA1 technology.",
    quote: "Web3 gaming is built on the principle that players should truly own their digital assets. This isn't possible without reliable metadata and attribution systems that work across platforms.",
    category: "Gaming",
    tags: "Gaming,NFT,Web3,Investment"
  },
  {
    name: "Vitalik Buterin",
    role: "Co-founder of Ethereum",
    twitter: "@VitalikButerin",
    background: "Creator of the leading smart contract platform. Influential voice in blockchain technology. Focus on practical applications of Web3. Potential advocate for DA1's blockchain verification approach.",
    quote: "Blockchain verification of creative work is a perfect use case that bridges Web2 and Web3. We need systems that connect existing content ecosystems with on-chain verification.",
    category: "Technology",
    tags: "Technology,Blockchain,Ethereum,Web3"
  },
  {
    name: "Brian Armstrong",
    role: "CEO and co-founder of Coinbase",
    twitter: "@brian_armstrong",
    background: "Leads major crypto exchange with interest in NFTs and creator tools. Strong connections to blockchain ecosystem. Potential partner for verification services. Strategic investor in Web3 technologies.",
    quote: "Cryptocurrency is just the beginning of blockchain application. Digital attribution and verification of creative work represents the next major frontier for this technology.",
    category: "Technology",
    tags: "Technology,Crypto,Exchange,Business"
  },
  {
    name: "Melanie Perkins",
    role: "CEO and co-founder of Canva",
    twitter: "@melaniecanva",
    background: "Built major design platform used by millions of creators. Strong focus on democratizing design tools. Canva could implement DA1 attribution system. Influential voice in creative technology.",
    quote: "Design tools should empower creators not just to make beautiful work, but to maintain ownership of that work across the digital ecosystem. Attribution is a fundamental right.",
    category: "Design",
    tags: "Design,Technology,Platform,Business"
  },
  {
    name: "John Knoll",
    role: "Chief Creative Officer at Industrial Light & Magic, co-creator of Photoshop",
    twitter: "@knoll",
    background: "Visual effects pioneer with deep understanding of digital media workflows. Co-created Photoshop, the foundational tool for digital imaging. Highly respected in film and design industries.",
    quote: "As someone who's worked with digital images from the beginning, I've seen how the lack of persistent metadata has undermined creator rights. We need technical solutions that respect the value chain of creation.",
    category: "Visual",
    tags: "Visual,Film,Effects,Photoshop"
  },
  {
    name: "Tyler Perry",
    role: "Filmmaker, actor, and studio owner",
    twitter: "@tylerperry",
    background: "Created independent studio with complete ownership of content. Strong advocate for creator control and ownership. Massive influence in film and television industry. Personal experience with attribution challenges.",
    quote: "Ownership means nothing without the technical infrastructure to maintain attribution. Too many creators lose control of their work simply because platforms strip away the connection.",
    category: "Film",
    tags: "Film,Television,Studio,Independent"
  },
  {
    name: "Kathleen Kennedy",
    role: "President of Lucasfilm",
    twitter: "@KathleenKennedy",
    background: "Leader of major film studio with valuable intellectual property. Decades of experience in content creation and management. Connection to Disney ecosystem. Influential voice in entertainment industry.",
    quote: "In franchise management, proper attribution of creative contributions isn't just ethically important - it's essential for maintaining the integrity of the creative process across multiple projects.",
    category: "Film",
    tags: "Film,StarWars,Disney,Studio"
  },
  {
    name: "Kevin Feige",
    role: "President of Marvel Studios",
    twitter: "@Kevfeige",
    background: "Architect of the world's most successful film franchise. Manages complex web of creative contributors. Strong focus on building connected universe of content. Influential voice in entertainment industry.",
    quote: "Creating connected universes of content requires robust systems for tracking and attributing creative contributions. Without this infrastructure, the collaborative process breaks down.",
    category: "Film",
    tags: "Film,Marvel,Disney,Franchise"
  }
];

// Generate HTML template function
function generateOutreachHTML(contact, publishDate, displayDate) {
  const fileName = contact.name.toLowerCase().replace(/[^\w]/g, '-').replace(/--+/g, '-');
  
  // Create tweets that fit character limits (under 280 chars)
  const verificationTweet = `@${contact.twitter.substring(1)} Hi ${contact.name.split(' ')[0]}, did you really say: "${contact.quote.substring(0, 100)}..."? Wanted to check...great quote btw...the DA1 team`;
  
  const invitationTweet = `@${contact.twitter.substring(1)} Your work in the field of ${contact.category.toLowerCase()} continues to inspire. We're inviting you to ask 'Dawon', our chatbot, anything about DA1metaMetaData here: https://da1.fm/chat.html`;

  return `<!DOCTYPE html>
<html lang="en" data-publish-status="draft" data-tweet-status="pending">
<head>
    <!-- Core Meta Tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Outreach to ${contact.name} - DA1</title>
    <meta name="description" content="DA1's outreach to ${contact.name} about digital attribution and creator rights.">
    
    <!-- DA1 Outreach Metadata -->
    <meta name="da1:target" content="${contact.name}">
    <meta name="da1:target-role" content="${contact.role}">
    <meta name="da1:target-twitter" content="${contact.twitter}">
    <meta name="da1:publish-date" content="${publishDate}">
    <meta name="da1:category" content="${contact.category}">
    <meta name="da1:tags" content="${contact.tags}">
    
    <!-- Social Media Tags -->
    <meta property="og:title" content="Outreach to ${contact.name} - DA1">
    <meta property="og:description" content="DA1's outreach to ${contact.name} about digital attribution and creator rights.">
    <meta property="og:url" content="https://da1.fm/outreach/posts/${fileName}.html">
    <meta property="og:type" content="article">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Outreach to ${contact.name} - DA1">
    <meta name="twitter:description" content="DA1's outreach to ${contact.name} about digital attribution and creator rights.">
    
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
            <div class="category-tag">${contact.category}</div>
            <h1>Outreach to ${contact.name}</h1>
            <div class="outreach-meta">
                <span><i class="bi bi-person"></i> Target: ${contact.name}</span>
                <span><i class="bi bi-briefcase"></i> ${contact.role}</span>
                <span><i class="bi bi-twitter"></i> ${contact.twitter}</span>
                <span><i class="bi bi-calendar3"></i> ${displayDate}</span>
            </div>
        </div>

        <!-- Target Information -->
        <div class="target-info">
            <h2>About ${contact.name}</h2>
            <div class="target-details">
                <p><strong>Role:</strong> <span class="target-role">${contact.role}</span></p>
                <p><strong>Background:</strong> <span class="target-background">${contact.background}</span></p>
                <p><strong>Quote:</strong> <blockquote class="target-quote">"${contact.quote}"</blockquote></p>
            </div>
        </div>

        <!-- Personalized Outreach Message -->
        <div class="outreach-message">
            <h2>Personalized Message</h2>
            <p>Dear ${contact.name.split(' ')[0]}, your work in the ${contact.category.toLowerCase()} space has been inspirational to us at DA1. Your insights about "${contact.quote.substring(0, 50)}..." resonate deeply with our mission.</p>
            <p>At DA1, we've developed a metaMetadata system that ensures attribution data persists throughout the entire digital journey of creative work. Our approach creates a persistent layer of attribution that survives when content travels across platforms that typically strip this data. Given your unique perspective, we believe your insights on our solution would be incredibly valuable.</p>
        </div>
        
        <!-- Tweet Content -->
        <div class="tweet-content">
            <h2>Tweet 1: Verification Tweet</h2>
            <p data-tweet-text="${verificationTweet}">${verificationTweet}</p>
            <div class="tweet-status pending">Pending</div>
        </div>
    
        <!-- Tweet 2: Invitation Tweet -->
        <div class="tweet-content">
            <h2>Tweet 2: Invitation Tweet</h2>
            <p data-tweet-text="${invitationTweet}">${invitationTweet}</p>
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
</html>`;
}

// Generate files with dates from May 5 to May 31 (2 per day = 27 days x 2 = 54 possible slots)
function generateFiles() {
  // Create an array of file outputs
  const outputs = [];
  
  // Create an array to track which files to add to outreach-posts.txt
  const fileNames = [];
  
  // Generate dates - 2 per day from May 5 through May 31
  for (let i = 0; i < contacts.length; i++) {
    // Calculate day offset (0, 0, 1, 1, 2, 2, etc.)
    const dayOffset = Math.floor(i / 2);
    
    // Create date object for May 5 + dayOffset
    const date = new Date(2025, 4, 5 + dayOffset);
    
    // Format ISO date for metadata (T21:00:00.000Z matches existing pattern)
    const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T21:00:00.000Z`;
    
    // Format display date (e.g., "May 5, 2025")
    const displayDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Generate HTML
    const html = generateOutreachHTML(contacts[i], isoDate, displayDate);
    
    // Create filename
    const fileName = contacts[i].name.toLowerCase().replace(/[^\w]/g, '-').replace(/--+/g, '-') + '.html';
    
    // Add to outputs
    outputs.push({
      fileName,
      html
    });
    
    // Add to list of filenames
    fileNames.push(fileName);
  }
  
  // Return the outputs and filenames
  return {
    outputs,
    fileNames
  };
}

// Export functions and data for use in other scripts
// For browser environments, add to window
if (typeof window !== 'undefined') {
  window.contacts = contacts;
  window.generateOutreachHTML = generateOutreachHTML;
  window.generateFiles = generateFiles;
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    contacts,
    generateOutreachHTML,
    generateFiles
  };
}

// Ready message
console.log("Ready to generate " + contacts.length + " outreach HTML files");