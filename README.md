# beacon-testing

#Tests: 

```
% gulp test
```

#Build:

```
% ionic build ios
```

#Deploy server to Heroku 

1. In beacon-production/server: % mv .git ..
2. Trash server
3. Copy new server to beacon-production/ from beacon-testing/linkedin/server
4. % mv .git server

```
% git add -A
% git commit -a -m 'Server update & deploy: '
% git push heroku master
```

#Deploy to TestFlight

1. Make sure www/lib/meteor-client-side/meteor-runtime-config.js is set to Production address
2. Make sure flags in config.platform are set to production values
3. Build project in ionic
4. In Xcode: General > Identity: Increment build or version number
5. In Xcode: Product > Archive etc . . . see Issue #36 for detailed discussion of how this was set up. 
6. To use the release build in development - go to Product > Scheme > Edit Scheme and change the run settings. (This is necessary to get push notifictions to work).
7. In iTunesConnect > Apps > TestFlight, select the new version to test. (These process for a while before they are available). 