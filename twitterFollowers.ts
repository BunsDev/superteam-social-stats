import axios from 'axios';
require('dotenv').config();
const Airtable = require('airtable');

interface Followers {
  [username: string]: number;
}

const bearerToken = process.env.TWITTER_BEARER_TOKEN;
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appiQY5Sa4fJ0mGYG');

const getFollowers = async (username: string): Promise<number> => {
  try {
    const res = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`
      },
      params: {
        'user.fields': 'public_metrics'
      }
    });

    const followerCount: number = res.data.data.public_metrics.followers_count;
    return followerCount;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

const fetchAndUpdateTwitterFollowers = async (usernames: string[], recordIds: string[]): Promise<void> => {
  try {
    for (let i = 0; i < usernames.length; i++) {
      const username = usernames[i];
      const recordId = recordIds[i];
      const followerCount: number = await getFollowers(username);

      base('Countries List').update([
        {
          "id": recordId,
          "fields": {
              'Twitter Followers': followerCount.toString(),
          }
        }
      ], function(err, records) {
        if (err) {
          console.error(err);
          return;
        }
        records.forEach(function(record) {
          console.log(`Twitter username: ${username}, Followers: ${record.get('Twitter Followers')}`);
        });
      });
    }
    console.log('Successfully updated Twitter Followers')
  } catch (err) {
    console.log(err);
  }
};

const recordIds: string[] = ['recdHfrwZYRRbihy1', 'recOl8Sebk6EjY5VS', 'recMLZQnxbJ88dgBx', 'rechGu7UtJn4H0o0H', 'receSh3t0nTEYqJeV', 'rec7NwA8Xkcjwi3MB', 'recN0fJoygqWligZR', 'rec3bPgmUCgKarurT'];
const twitterUsernames: string[] = [];

base('Countries List').select({
  view: 'Grid view'
}).eachPage(
  function page(records, fetchNextPage) {
    records.forEach(function (record) {
      const username = record.get('Twitter Usernames');
      if (username) {
        twitterUsernames.push(username.toString());
      }
    });

    fetchNextPage();
  },
  function done(err) {
    if (err) {
      console.error(err);
      return;
    }
    fetchAndUpdateTwitterFollowers(twitterUsernames, recordIds);
  }
);
