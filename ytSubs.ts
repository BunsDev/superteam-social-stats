import axios from 'axios';
require('dotenv').config();
const Airtable = require('airtable');

interface ChannelSubscribers {
    [channelId: string]: string | undefined;
}

const YT_API_KEY = process.env.YT_API_KEY;
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

const fetchAndUpdateYouTubeSubscribers = async (channelData: ChannelSubscribers): Promise<void> => {
    try {
        for (const channelId in channelData) {
            const recordId = channelData[channelId];
            const subscriberCount: string | undefined = await getChannelSubscribers(channelId);

            base('Countries').update([
                {
                    "id": recordId,
                    "fields": {
                        'Youtube': subscriberCount,
                    }
                }
            ], function (err, records) {
                if (err) {
                    console.error(err);
                    return;
                }
                records.forEach(function (record) {
                    console.log(`Youtube Channel ID: ${channelId}, Subs: ${record.get('Youtube')}`);
                });
            });
        }
        console.log('Successfully updated Youtube Subs');
    } catch (err) {
        console.log(err);
    }
};

const channelData: ChannelSubscribers = {};

base('Countries').select({
    view: 'Grid view'
}).eachPage(
    function page(records, fetchNextPage) {
        records.forEach(function (record) {
            const channelId = record.get('Youtube Channel ID');
            const recordId = record.id;
            if (channelId && recordId) {
                channelData[channelId] = recordId;
            }
        });

        fetchNextPage();
    },
    function done(err) {
        if (err) {
            console.error(err);
            return;
        }
        fetchAndUpdateYouTubeSubscribers(channelData);
    }
);
