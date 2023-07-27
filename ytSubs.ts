import axios from 'axios';
require('dotenv').config();
const Airtable = require('airtable');

interface ChannelSubscribers {
    [channelId: string]: string | undefined;
}

const YT_API_KEY = process.env.YT_API_KEY;
const bearerToken = process.env.TWITTER_BEARER_TOKEN;
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appiQY5Sa4fJ0mGYG');

const getChannelSubscribers = async (channelId: string): Promise<string | undefined> => {
    try {
        const res = await axios.get(
            `https://www.googleapis.com/youtube/v3/channels`,
            {
                params: {
                    part: 'statistics',
                    id: channelId,
                    key: YT_API_KEY,
                },
            }
        );

        const subscriberCount: string = res.data.items[0].statistics.subscriberCount;
        return subscriberCount;
    } catch (err) {
        console.log(err);
        return undefined;
    }
};

const fetchAndUpdateYouTubeSubscribers = async (channelIds: string[], recordIds: string[]): Promise<void> => {
    try {
        for (let i = 0; i < channelIds.length; i++) {
            const channelId = channelIds[i];
            const recordId = recordIds[i];
            const subscriberCount: string | undefined = await getChannelSubscribers(channelId);

            base('Countries List').update([
                {
                    "id": recordId,
                    "fields": {
                        'YouTube Subs': subscriberCount,
                    }
                }
            ], function (err, records) {
                if (err) {
                    console.error(err);
                    return;
                }
                records.forEach(function (record) {
                    console.log(`YouTube Channel ID: ${channelId}, Subs: ${record.get('YouTube Subs')}`);
                });
            });
        }
        console.log('Successfully updated YouTube Subs');
    } catch (err) {
        console.log(err);
    }
};



const recordIds: string[] = ['recdHfrwZYRRbihy1', 'recOl8Sebk6EjY5VS', 'recMLZQnxbJ88dgBx', 'rechGu7UtJn4H0o0H', 'receSh3t0nTEYqJeV'];
const youtubeChannelIds: string[] = ['UCi-pkXLbm7sqXFhV1NBLUfQ', 'UCJdJ0tgvjaYDogjSDPC_8hQ', 'UCJdJ0tgvjaYDogjSDPC_8hQ', 'UCmORmg2X_qnK4AtGQmzHAWw', 'UChbtjy87e4N28tvlsYg3yOQ'];

fetchAndUpdateYouTubeSubscribers(youtubeChannelIds, recordIds);
