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
    console.error(`Error fetching followers for Twitter username: ${username}`);
    console.error(err);
    return 0;
  }
};

const fetchAndUpdateTwitterFollowers = async (usernames: Followers): Promise<void> => {
  for (const username in usernames) {
    const recordId = usernames[username];
    try {
      const followerCount: number = await getFollowers(username);

      base('Countries').update([
        {
          "id": recordId,
          "fields": {
            'Twitter': followerCount 
          }
        }
      ], function(err, records) {
        if (err) {
          console.error(`Error updating followers for Twitter username: ${username}`);
          console.error(err);
          return;
        }
        records.forEach(function(record) {
          console.log(`Successfully updated Twitter followers for ${username}: ${record.get('Twitter')}`);
        });
      });
    } catch (err) {
      console.error(`Error processing Twitter username: ${username}`);
      console.error(err);
    }
  }
};

const usernames: Followers = {};

base('Countries').select({
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
      console.error("Error during Airtable fetch:", err);
      return;
    }
    fetchAndUpdateTwitterFollowers(usernames);
  }
);
