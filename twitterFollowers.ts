import axios from 'axios';
require('dotenv').config();
const Airtable = require('airtable');

interface Followers {
  [username: string]: string;
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

const fetchAndUpdateTwitterFollowers = async (usernames: Followers): Promise<void> => {
  try {
    for (const username in usernames) {
      const recordId = usernames[username];
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

const usernames: Followers = {};

base('Countries List').select({
  view: 'Grid view'
}).eachPage(
  function page(records, fetchNextPage) {
    records.forEach(function (record) {
      const username = record.get('Twitter Usernames');
      const recordId = record.id;
      if (username && recordId) {
        usernames[username] = recordId;
      }
    });

    fetchNextPage();
  },
  function done(err) {
    if (err) {
      console.error(err);
      return;
    }
    fetchAndUpdateTwitterFollowers(usernames);
  }
);
