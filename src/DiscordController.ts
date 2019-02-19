export const ps4ClientId : string 		= '541917623240097795';
export const ps3ClientId : string 		= '459823182044725269';
export const psVitaClientId : string 	= '493957159323828259';

let discordClient : any;

import { dialog } from 'electron';
import log = require('electron-log');
import { IDiscordPresenceModel, IDiscordPresenceUpdateOptions } from './Model/DiscordPresenceModel';

const packageJson = require('../package.json');

interface IDiscordPresenceDefaultDataModel
{
  	instance : boolean;
	largeImageKey : string;
	largeImageText : string;
  	smallImageKey : string;
  	smallImageText : string;
}

export class DiscordController
{
	private _currentConsole : string;
	private _running : boolean = false;
	private _lastStartTimestamp : number;
	private _defaultInfo : IDiscordPresenceDefaultDataModel =  {
		instance: true,
		largeImageKey: 'ps4_main',
		largeImageText: 'PlayStation 4',
		smallImageKey: 'ps4_main',
		smallImageText: 'PlayStation 4'
	};

	constructor(clientId: string)
	{
		this._currentConsole = clientId;

		discordClient = require('discord-rich-presence')(clientId);

		this._running = true;

		discordClient.on('error', (err: any) => {
			log.error('An error occurred while communicating with Discord', err);
			dialog.showMessageBox(null, {
				type: 'error',
				title: 'PlayStationDiscord Error',
				message: 'An error occurred while communicating with Discord',
				detail: err.toString()
			});

			this._running = false;
		});
	}

	public running() : boolean
	{
		return this._running;
	}

	public stop() : void
	{
		discordClient.disconnect();
		this._running = false;
	}

	public update(data: IDiscordPresenceModel, options?: IDiscordPresenceUpdateOptions) : Promise<void>
	{
		return new Promise((resolve, reject) => {
			if (!this.running())
			{
				reject('discord controller not running');
			}
			else
			{
				const usingOptions = options !== undefined;

				if (!usingOptions || !options.hideTimestamp)
				{
					if (data.startTimestamp === undefined)
					{
						data.startTimestamp = this._lastStartTimestamp;
					}
					else
					{
						this._lastStartTimestamp = data.startTimestamp;
					}
				}

				discordClient.updatePresence({...this._defaultInfo, ...data});
				resolve();
			}
		});
	}
}
