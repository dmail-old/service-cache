import Cache from '../../lib/service-cache/cache.js';
import Request from '../../lib/request.js';
import Response from '../../lib/response.js';

export function suite(add){

	add("maxLength", function(test){
		var cache = Cache.create();
		cache.maxLength = 1;

		var reqA = Request.create();
		var reqB = Request.create({method: 'post'}); // must be a diff request, else it's considered as cached
		var resA = Response.create();
		var resB = Response.create();

		cache.set(reqA, resA);
		test.equal(cache.has(reqA), true);
		test.equal(cache.length, 1);
		cache.set(reqB, resB);
		test.equal(cache.has(reqA), false);
	});

	add("byteLimit", function(test){
		var cache = Cache.create();
		cache.byteLimit = 10;

		var requestA = Request.create();
		var responseA = Response.create({
			body: '',
			headers: {
				'content-length': 5
			}
		});
		var responseB = Response.create({
			body: '',
			headers: {
				'content-length': 15
			}
		});

		cache.set(requestA, responseA);
		test.equal(cache.byteLength, 5);

		return test.rejectWith(new Promise(function(){
			cache.set(requestA, responseB);
		}), {name: 'RangeError'});
	});

	add("vary headers", function(){

	});

}