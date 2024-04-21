// Wait for the DOM to be fully loaded
  // Find the div with the class name "dropdown-filter"
  var dropdownFilter = document.getElementsByClassName('dropdown-filter');
  console.log(dropdownFilter);
  console.log("1yerr");

  if (dropdownFilter) {
    console.log("yerr");
    // Create a new button element
    var button = document.createElement('button');
    button.textContent = 'Freemium Export';

    // Add any desired styles or classes to the button
    button.style.marginLeft = '10px';

    // Add a click event listener to the button (optional)
    button.addEventListener('click', scrapeData);

    // Insert the button beside the div
    dropdownFilter[0].insertAdjacentElement('beforeend', button);

  };

async function scrapeData() {
  const yLink = "https://www.screener.in/screens/1652356/yab/?sort=market+capitalization&order=desc";
  const mLink = yLink;
  const headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
    'accept-language': 'en,gu;q=0.9,hi;q=0.8',
    'accept-encoding': 'gzip, deflate, br'
  };

  const data = [];
  const datas = [['ExchCode']];

  try {
    const response = await fetch(mLink + "?limit=50&page=1", { headers });
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const table = doc.querySelector('table.data-table');
    const tableBody = table.querySelector('tbody');
    let rows = tableBody.querySelectorAll('tr');

    rows.forEach(row => {
      const cols = Array.from(row.querySelectorAll('th')).map(ele => ele.textContent.trim());
      for (let i = 0; i < cols.length; i++) {
        if (cols[i].includes("\n") ){
          cols[i] = cols[i].split("\n")[0]+" "+cols[i].split("\n")[1];
        }
      }
      console.log("COLUMN HEAD DATA",cols);
      data.push(cols.filter(ele => ele));
    });

    let pagen = 1;
    const pageLinks = doc.querySelectorAll('a.ink-900');
    pageLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href.includes('&page=')) {
        pagen = href.split('&page=')[1];
      }
    });

    for (let x = 1; x <= pagen; x++) {
      console.log(x);
      const sLink = mLink + "?limit=50&page=" + x;
      const response = await fetch(sLink, { headers });
      const html = await response.text();
      const doc = parser.parseFromString(html, 'text/html');

      const table = doc.querySelector('table.data-table');
      const tableBody = table.querySelector('tbody');
      rows = tableBody.querySelectorAll('tr');

      rows.forEach(row => {
        const link = row.querySelector('a[href*="/company/"]');
        if (link) {
          const symlink = link.getAttribute('href');
          const symcode = symlink.split('/')[2];
          datas.push([symcode]);
          const cols = Array.from(row.querySelectorAll('td')).map(ele => ele.textContent.trim());
          data.push(cols.filter(ele => ele));
        }
      });
    }

    const df = data.map(row => row.join(',')).join('\n');
    const dfs = datas.map(row => row.join(',')).join('\n');

    console.log(dfs);

    rows = df.split('\n');
    const filteredRows = rows.filter(row => row.trim() !== '');
    const finalDf = filteredRows.join('\n');

    const finalData = finalDf.split('\n').map((row, index) => {
      const columns = row.split(',');
      if (index < datas.length) {
        columns.splice(2, 0, datas[index][0]);
      }
      return columns.join(',');
    }).join('\n');

    console.log(finalData);

    // Download the CSV file
    const blob = new Blob([finalData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'screener.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error:', error);
  }
}

