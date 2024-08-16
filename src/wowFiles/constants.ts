export const constants = {
    PRODUCTS: [
		{ product: 'wow', title: 'World of Warcraft', tag: 'Retail' },
		{ product: 'wowt', title: 'PTR: World of Warcraft', tag: 'PTR' },
		{ product: 'wowxptr', title: 'PTR 2: World of Warcraft', tag: 'PTR 2'},
		{ product: 'wow_beta', title: 'Beta: World of Warcraft', tag: 'Beta' },
		{ product: 'wow_classic', title: 'World of Warcraft Classic', tag: 'Classic' },
		{ product: 'wow_classic_beta', title: 'Beta: World of Warcraft Classic', tag: 'Classic Beta' },
		{ product: 'wow_classic_ptr', title: 'PTR: World of Warcraft Classic', tag: 'Classic PTR' },
		{ product: 'wow_classic_era', title: 'World of Warcraft Classic Era', tag: 'Classic Era' },
		{ product: 'wow_classic_era_ptr', title: 'PTR: World of Warcraft Classic Era', tag: 'Classic Era PTR' }
	],
	MAGIC: {
		MD21: 0x3132444D, // M2 model magic.
		MD20: 0x3032444D // M2 model magic (legacy)
	},
	BUILDINFO: `Branch!STRING:0|Active!DEC:1|Build Key!HEX:16|CDN Key!HEX:16|Install Key!HEX:16|IMSize!DEC:4|CDN Path!STRING:0|CDN Hosts!STRING:0|CDNServers!STRING:0|Tags!STRING:0|Armadillo!STRING:0|LastActivated!STRING:0|Version!STRING:0|Product!STRING:0
en|1|43b2762b8e4a57c4771a5cf9a1d99661|8be9cf988078dd923677d222be5dfe38|100266553e76780ff294c0ed6e804878||tpr/wow|level3.blizzard.comus.cdn.blizzard.com|http://level3.blizzard.com/?maxhosts=4http://us.cdn.blizzard.com/?maxhosts=4 https://blzddist1-a.akamaihd.net/?fallback=1&maxhosts=4https://level3.ssl.blizzard.com/?fallback=1&maxhosts=4https://us.cdn.blizzard.com/?fallback=1&maxhosts=4|Windows x86_64 US? acct-SGP? geoip-SG?enUS speech?:Windows x86_64 US? acct-SGP? geoip-SG? enUS text?|||9.2.7.45745|wow`
}

export default constants;