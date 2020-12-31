const nodeFetch = require('node-fetch');
const fetch = require('fetch-cookie')(nodeFetch);
const cheerio = require('cheerio');
const moment = require('moment');
const fs = require('fs');

let url = 'http://kenyalaw.org/caselaw/cases/advanced_search/';
const cases = [];
const from = '01 Dec 2005';
const to = '14 Jan 2006';

async function getCases(page) {
  try {
    if (page > 70) {
      return
    } else {
      if (page) {
        url = 'http://kenyalaw.org/caselaw/cases/advanced_search/' + 'page/' + page;
        page += 10;
      }
      console.log(url);

      const res = await fetch(url, {
        method: 'post',
        body: `content=&subject=&case_number=&parties=&date_from=${from}&date_to=${to}&submit=Search`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      
      const $ = cheerio.load(await res.text());
    
      $('.post').each((i, ele) => {
        const post = $(ele);
    
        const title = post
          .find('h2')
          .first()
          .text()
          .trim();
        
        const url = post
          .find('a')
          .last()
          .attr('href');
        
        let date = post
          .find('table > tbody tr:nth-child(2) td:last-child')
          .contents()
          .not('span')
          .text();
        date = new Date(date);
        date = moment(date).format('YYYY-MM-DD');
        
        const eachCase = {
          title: title,
          url: url,
          date: date
        }
    
        cases.push(eachCase);
        
      })
      // console.log(cases);

      fs.writeFile('cases.html', JSON.stringify(cases), () => {
        console.log(`${cases.length} cases saved to 'cases.html' `); 
      });

      page ? getCases(page) : getCases(10);

    }
  } catch (err) {
    console.error(err)
  }
}

getCases();