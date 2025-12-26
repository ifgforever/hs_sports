2025-12-26T06:26:44.344528Z	Cloning repository...
2025-12-26T06:26:44.883497Z	From https://github.com/ifgforever/hs_sports
2025-12-26T06:26:44.883926Z	 * branch            151cc53041896c7019665b664fda090bf3f91076 -> FETCH_HEAD
2025-12-26T06:26:44.884095Z	
2025-12-26T06:26:44.907902Z	HEAD is now at 151cc53 Fix missing newline at end of channel.html
2025-12-26T06:26:44.908386Z	
2025-12-26T06:26:44.97578Z	
2025-12-26T06:26:44.976258Z	Using v2 root directory strategy
2025-12-26T06:26:44.997705Z	Success: Finished cloning repository files
2025-12-26T06:26:46.877724Z	Checking for configuration in a Wrangler configuration file (BETA)
2025-12-26T06:26:46.878361Z	
2025-12-26T06:26:47.978194Z	No wrangler.toml file found. Continuing.
2025-12-26T06:26:47.978597Z	No build command specified. Skipping build step.
2025-12-26T06:26:47.979194Z	Found Functions directory at /functions. Uploading.
2025-12-26T06:26:47.98507Z	 ⛅️ wrangler 3.101.0
2025-12-26T06:26:47.985324Z	-------------------
2025-12-26T06:26:49.06226Z	[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mBuild failed with 3 errors:[0m
2025-12-26T06:26:49.063117Z	
2025-12-26T06:26:49.063235Z	  [31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "@tsndr/cloudflare-worker-jwt"[0m
2025-12-26T06:26:49.063817Z	  
2025-12-26T06:26:49.063975Z	      api/_util.js:3:16:
2025-12-26T06:26:49.064096Z	  [37m      3 │ import jwt from [32m"@tsndr/cloudflare-worker-jwt"[37m;
2025-12-26T06:26:49.064214Z	          ╵                 [32m~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m
2025-12-26T06:26:49.064675Z	  
2025-12-26T06:26:49.064834Z	    You can mark the path "@tsndr/cloudflare-worker-jwt" as external to exclude it from the bundle, which will remove this error.
2025-12-26T06:26:49.06502Z	  
2025-12-26T06:26:49.06511Z	  
2025-12-26T06:26:49.065176Z	  [31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "bcryptjs"[0m
2025-12-26T06:26:49.065238Z	  
2025-12-26T06:26:49.065298Z	      api/auth/login.js:2:19:
2025-12-26T06:26:49.065361Z	  [37m      2 │ import bcrypt from [32m"bcryptjs"[37m;
2025-12-26T06:26:49.065431Z	          ╵                    [32m~~~~~~~~~~[0m
2025-12-26T06:26:49.065493Z	  
2025-12-26T06:26:49.065554Z	    You can mark the path "bcryptjs" as external to exclude it from the bundle, which will remove this error.
2025-12-26T06:26:49.065609Z	  
2025-12-26T06:26:49.065661Z	  
2025-12-26T06:26:49.065729Z	  [31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "bcryptjs"[0m
2025-12-26T06:26:49.065804Z	  
2025-12-26T06:26:49.065863Z	      api/auth/signup.js:2:19:
2025-12-26T06:26:49.06592Z	  [37m      2 │ import bcrypt from [32m"bcryptjs"[37m;
2025-12-26T06:26:49.066022Z	          ╵                    [32m~~~~~~~~~~[0m
2025-12-26T06:26:49.066098Z	  
2025-12-26T06:26:49.066154Z	    You can mark the path "bcryptjs" as external to exclude it from the bundle, which will remove this error.
2025-12-26T06:26:49.066262Z	  
2025-12-26T06:26:49.066334Z	  
2025-12-26T06:26:49.066395Z	
2025-12-26T06:26:49.066459Z	
2025-12-26T06:26:49.066521Z	
2025-12-26T06:26:49.068401Z	[31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mBuild failed with 3 errors:[0m
2025-12-26T06:26:49.068548Z	
2025-12-26T06:26:49.068712Z	  [31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "@tsndr/cloudflare-worker-jwt"[0m
2025-12-26T06:26:49.068881Z	  
2025-12-26T06:26:49.068998Z	      api/_util.js:3:16:
2025-12-26T06:26:49.069079Z	  [37m      3 │ import jwt from [32m"@tsndr/cloudflare-worker-jwt"[37m;
2025-12-26T06:26:49.069143Z	          ╵                 [32m~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m
2025-12-26T06:26:49.069202Z	  
2025-12-26T06:26:49.069268Z	    You can mark the path "@tsndr/cloudflare-worker-jwt" as external to exclude it from the bundle, which will remove this error.
2025-12-26T06:26:49.069331Z	  
2025-12-26T06:26:49.069391Z	  
2025-12-26T06:26:49.069465Z	  [31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "bcryptjs"[0m
2025-12-26T06:26:49.069522Z	  
2025-12-26T06:26:49.069578Z	      api/auth/login.js:2:19:
2025-12-26T06:26:49.06964Z	  [37m      2 │ import bcrypt from [32m"bcryptjs"[37m;
2025-12-26T06:26:49.069703Z	          ╵                    [32m~~~~~~~~~~[0m
2025-12-26T06:26:49.069765Z	  
2025-12-26T06:26:49.069822Z	    You can mark the path "bcryptjs" as external to exclude it from the bundle, which will remove this error.
2025-12-26T06:26:49.069882Z	  
2025-12-26T06:26:49.069974Z	  
2025-12-26T06:26:49.070056Z	  [31m✘ [41;31m[[41;97mERROR[41;31m][0m [1mCould not resolve "bcryptjs"[0m
2025-12-26T06:26:49.070115Z	  
2025-12-26T06:26:49.070179Z	      api/auth/signup.js:2:19:
2025-12-26T06:26:49.070245Z	  [37m      2 │ import bcrypt from [32m"bcryptjs"[37m;
2025-12-26T06:26:49.070299Z	          ╵                    [32m~~~~~~~~~~[0m
2025-12-26T06:26:49.070409Z	  
2025-12-26T06:26:49.070575Z	    You can mark the path "bcryptjs" as external to exclude it from the bundle, which will remove this error.
2025-12-26T06:26:49.070693Z	  
2025-12-26T06:26:49.070789Z	  
2025-12-26T06:26:49.070888Z	
2025-12-26T06:26:49.070956Z	
2025-12-26T06:26:49.093237Z	🪵  Logs were written to "/root/.config/.wrangler/logs/wrangler-2025-12-26_06-26-48_576.log"
2025-12-26T06:26:49.103838Z	Failed building Pages Functions.
2025-12-26T06:26:50.375135Z	Failed: generating Pages Functions failed. Check the logs above for more information. If this continues for an unknown reason, contact support: https://cfl.re/3WgEyrH
