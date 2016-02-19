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

1. Trash old visible files in beacon-production/server
2. copy over current ones from beacon-testing/linkedin/server
3. Then . . .

```
% git add -A
% git commit -a -m 'Server update & deploy: '
% git push heroku master
```

#Deploy to TestFlight

1. Make sure www/lib/meteor-client-side/meteor-runtime-config.js is set to Production address
2. Make sure flags in config.platform are set to production values
3. Build project in ionic
4. In Xcode: Product > Archive etc . . . see Issue #36 for detailed discussion of how this was set up
5. To use the release build in development - go to Product > Scheme > Edit Scheme and change the run settings 