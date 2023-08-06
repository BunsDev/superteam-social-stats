import axios from 'axios';
import fetch from 'node-fetch';
require('dotenv').config();
const Airtable = require('airtable');

interface GuildInfo {
    approximate_member_count: number;
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appiQY5Sa4fJ0mGYG');
const botToken = process.env.DISCORD_BOT_TOKEN;

const getMemberCount = async (guildId: string): Promise<number> => {
    const url = `https://discord.com/api/v9/guilds/${guildId}?with_counts=true`;

    try {
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bot ${botToken}`
            }
        });
        const guildInfo: GuildInfo = await res.json();
        return guildInfo.approximate_member_count;
    } catch (error) {
        console.error(`Error fetching member count for Guild ID: ${guildId}`);
        console.error('Error:', error);
        return 0;
    }
};

const fetchAndUpdateDiscordMembers = async (guildIds: { [guildId: string]: string }): Promise<void> => {
    for (const guildId in guildIds) {
        try {
            const recordId = guildIds[guildId];
            const memberCount: number = await getMemberCount(guildId);

            base('Countries List').update([
                {
                    "id": recordId,
                    "fields": {
                        'Discord Members': memberCount.toString(),
                    }
                }
            ], function(err, records) {
                if (err) {
                    console.error(err);
                    return;
                }
                records.forEach(function(record) {
                    console.log(`Discord Guild ID: ${guildId}, Members: ${record.get('Discord Members')}`);
                });
            });
            console.log(`Successfully updated Discord Members for Guild ID: ${guildId}`)
        } catch (err) {
            console.log(`Error updating Discord Members for Guild ID: ${guildId}`);
            console.log(err);
        }
    }
};

const guildIds: { [guildId: string]: string } = {};

base('Countries List').select({
    view: 'Grid view'
}).eachPage(
    function page(records, fetchNextPage) {
        records.forEach(function (record) {
            const guildId = record.get('Discord Guild ID');
            const recordId = record.id;
            if (guildId && recordId) {
                guildIds[guildId] = recordId;
            }
        });

        fetchNextPage();
    },
    function done(err) {
        if (err) {
            console.error(err);
            return;
        }
        fetchAndUpdateDiscordMembers(guildIds);
    }
);
