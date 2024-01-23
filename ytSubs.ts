const axios = require('axios');
require('dotenv').config();
const Airtable = require('airtable');

interface ChannelSubscribers {
    [channelId: string]: string | undefined;
}

const YT_API_KEY = process.env.YT_API_KEY;
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appiQY5Sa4fJ0mGYG');

const getChannelSubscribers = async (channelId: string): Promise<number | undefined> => {
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

        const subscriberCount: number = parseInt(res.data.items[0].statistics.subscriberCount);
        return subscriberCount;
    } catch (err) {
        console.error(`Error fetching subscriber count for YouTube Channel ID: ${channelId}`, err);
        return undefined;
    }
};

const fetchAndUpdateYouTubeSubscribers = async (channelData: ChannelSubscribers): Promise<void> => {
    try {
        for (const channelId in channelData) {
            const recordId = channelData[channelId];
            const subscriberCount: number | undefined = await getChannelSubscribers(channelId);

            if (subscriberCount === undefined) {
                console.error(`Error fetching subscribers for YouTube Channel ID: ${channelId}`);
                continue; // Skip to next iteration if subscriber count is undefined
            }

            base('Countries').update([
                {
                    "id": recordId,
                    "fields": {
                        'Youtube': subscriberCount, // Updating subscriber count
                    }
                }
            ], function (err, records) {
                if (err) {
                    console.error(`Error updating YouTube subscribers for Channel ID: ${channelId}`, err);
                    return;
                }
                records.forEach(function (record) {
                    console.log(`YouTube Channel ID: ${channelId}, Subs Updated: ${record.get('Youtube')}`);
                });
            });
        }
        console.log('Successfully updated YouTube subscriber counts');
    } catch (err) {
        console.error('Error in updating YouTube subscriber counts', err);
    }
};

const channelData: ChannelSubscribers = {};

base('Countries').select({
    view: 'Grid view'
}).eachPage(
    function page(records, fetchNextPage) {
        records.forEach(function (record) {
            const channelId = record.get('Youtube Channel ID'); // Getting YouTube Channel ID
            const recordId = record.id;
            if (channelId && recordId) {
                channelData[channelId] = recordId;
            }
        });

        fetchNextPage();
    },
    function done(err) {
        if (err) {
            console.error('Error during Airtable fetch:', err);
            return;
        }
        fetchAndUpdateYouTubeSubscribers(channelData);
    }
);
