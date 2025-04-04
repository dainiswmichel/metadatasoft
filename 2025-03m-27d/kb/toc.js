document.addEventListener('DOMContentLoaded', () => {
  const kbDir = '/da1-mvp-03/kb/';
  const toc = document.getElementById('toc');

  // Files you want to exclude
  const excludedFiles = [
    'left-sidebar.html',
    'right-sidebar.html',
    'footer.html'
  ];

  fetch(kbDir)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const links = Array.from(doc.querySelectorAll('a')).filter(link => {
        const href = link.getAttribute('href');

        return (
          href.endsWith('.html') &&
          !href.endsWith('index.html') &&
          !excludedFiles.includes(href.split('/').pop())
        );
      });

      toc.innerHTML = '';

      links.forEach(link => {
        fetch(link.href)
          .then(response => response.text())
          .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const title = doc.querySelector('title')
              ? doc.querySelector('title').textContent
              : link.href;

            const ogTitle = doc.querySelector('meta[property="og:title"]')
              ? doc.querySelector('meta[property="og:title"]').content
              : title;

            const ogDescription = doc.querySelector('meta[property="og:description"]')
              ? doc.querySelector('meta[property="og:description"]').content
              : 'No description available';

            const headings = Array.from(doc.querySelectorAll('h1, h2, h3')).map(heading => ({
              tag: heading.tagName.toLowerCase(),
              text: heading.textContent.trim()
            }));

            const fileBlock = document.createElement('div');
            fileBlock.classList.add('file-block');

            const fileLink = document.createElement('a');
            fileLink.href = link.href;
            fileLink.textContent = title;
            fileBlock.appendChild(fileLink);

            const ogTitleElem = document.createElement('p');
            ogTitleElem.textContent = ogTitle;
            fileBlock.appendChild(ogTitleElem);

            const ogDescriptionElem = document.createElement('p');
            ogDescriptionElem.textContent = ogDescription;
            fileBlock.appendChild(ogDescriptionElem);

            const headingsList = document.createElement('ul');
            headings.forEach(heading => {
              const headingItem = document.createElement('li');
              headingItem.innerHTML = `<${heading.tag}>${heading.text}</${heading.tag}>`;
              headingsList.appendChild(headingItem);
            });
            fileBlock.appendChild(headingsList);

            toc.appendChild(fileBlock);
          })
          .catch(error => {
            console.error('Error fetching file:', error);
          });
      });

      document.querySelector('.loading').style.display = 'none';
    })
    .catch(error => {
      console.error('Error fetching KB directory:', error);
      document.querySelector('.loading').textContent = 'Failed to load files.';
    });
});
