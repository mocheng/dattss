### DaTtSs: Realtime Statistics Aggregation Service

DaTtSs helps aggregating and displaying server-side (or any other type of)
statistics in realtime to better track servers and infrastructure behaviours.
It is largely inspired by statsd as well as the idea that
"You Can't Fix what you Can't Track".

This project is cloned from original https://github.com/teleportd/dattss since it 
is not supported.

Building a server-side statistics aggregation service yields a few difficulties
since the service must not overhelm the servers that are being tracked.
For that reason, pre-aggregation must happen client-side and partial-aggregates
only should be transmitted over the network with the right amount of aggregation
so that it is well compressed but not too much so that global aggregated values
can also be infered (approximatively but easily) from these partial aggregates.
DaTtSs also supports UDP packets like statsd for easy driver creation but it is
encouraged to use pre-aggregation when possible (It is not always the case,
like in PhP).

#### Features

- Counter, Timers, Gauges aggregation and display (val, 1mn moving average)
- Daily against Week average plot
- [Upcoming] Alerts Email, SMS, Phone (Above/Below Limits, Stopped Working,
  Stopped Responding)

#### Inspiration

DaTtSs is an acronym for `statsd`: the whole project is inpsired by the work
proposed by Flickr (perl + RDDTool) https://github.com/iamcal/Flickr-StatsD
and later on Etsy (nodeJS + Graphite) https://github.com/etsy/statsd

see also:
- http://code.flickr.com/blog/2008/10/27/counting-timing/
- http://codeascraft.etsy.com/2011/02/15/measure-anything-measure-everything/

#### Example Usage

```
 var dts = require('dattss').dattss({ auth: '...' });
 // or (if auth is passed through env or command line)
 var dts = require('dattss').dattss({});

 //...
 dts.agg('something.new', '1c');
 dts.agg('something.merge', '2c');
 dts.agg('something.query', '153ms');
 dts.agg('something.live', '23g');
```

#### Drivers & SDK

All the drivers and SDK tools for DaTtSs are maintaind in the `clients` folder
of the current repository.

##### Architecture

Client side code, generates 5s-partial aggregates that are kept in a rolling
1mn array serer side. Each minute, an approximate 1m-partial aggregate is
calculated from this array and stored in database. Additionally, a current
state is kept in memory and a 1mn mvg average calculated for each counter
from the 5s-partial aggregates array as well.

This means that memory must be big enough to handle all live data for all
current users of DaTtSs. This infrastructure can be easily scaled by splitting
data servers with a sharding solution based on user ids.
