import Cache from './cache.js';

import http from '../node_modules/@dmail/http/index.js';

var CacheService = http.createService({
	name: 'cache',

	constructor(options){
		CacheService.super.constructor.call(this, options);
		this.cache = Cache.create(options);
	},

	requestHandler(request){
		var cache = this.cache;

		if( cache ){
			var cacheMode = request.cacheMode;
			var cachedResponse;
			var promise;

			if( cacheMode == 'default' ){
				cachedResponse = cache.get(request);
			}

			// test if the cached response has expired
			if( cachedResponse ){
				if( cachedResponse.headers.has('expires') && cachedResponse.headers.has('date') ){
					var ellapsedTime = new Date() - new Date(cachedResponse.headers.get('date'));

					if( ellapsedTime > cachedResponse.headers.get('expires') ){
						cache.delete(request);
						cachedResponse = null;
					}
				}
			}

			if( cachedResponse ){
				// il y a des choses à faire avant de valider la réponse
				if( cachedResponse.headers.has('last-modified') ){
					request.headers.set('if-modified-since', cachedResponse.headers.get('last-modified'));
				}
				// resolve immediatly
				else if( cachedResponse.cacheState === 'validated' || cachedResponse.cacheState === 'local' ){
					return cachedResponse.clone();
				}
			}
		}
	},

	responseHandler(request, response){
		var cache = this.cache, status = response.status;

		if( cache ){
			if( status === 304 ){
				var cachedResponse = cache.get(request);

				if( cachedResponse == null ){
					throw new Error('no cache for 304 response');
				}
				else{
					response = cachedResponse.clone();
					response.status = 200;
					response.cacheState = 'validated';
				}
			}
			if( request.cacheMode === 'default' || request.cacheMode === 'force-cache' || request.cacheMode === 'reload' ){
				cache.set(request, response);
			}
		}
	}
});

export default CacheService;