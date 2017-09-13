function ArcadeAudio() {
  this.sounds = {};
}

ArcadeAudio.prototype.add = function( key, count, settings ) {
  this.sounds[ key ] = [];
  settings.forEach( function( elem, index ) {
    this.sounds[ key ].push( {
      tick: 0,
      count: count,
      pool: []
    } );
    for( var i = 0; i < count; i++ ) {
      var audio = new Audio();
      audio.src = jsfxr( elem );
      this.sounds[ key ][ index ].pool.push( audio );
    }
  }, this );
};

ArcadeAudio.prototype.play = function( key ) {
  var sound = this.sounds[ key ];
  var soundData = sound.length > 1 ? sound[ Math.floor( Math.random() * sound.length ) ] : sound[ 0 ];
  soundData.pool[ soundData.tick ].play();
  soundData.tick < soundData.count - 1 ? soundData.tick++ : soundData.tick = 0;
};

var aa = new ArcadeAudio();

aa.add( 'laser', 5,
  [
    //[1,,0.2923,0.2756,0.0352,0.6778,0.2,-0.2526,,,,,,0.0766,0.1339,,,,1,,,0.2094,,0.38],
    [0,,0.15,0.5099,0.2743,0.9399,0.2726,-0.36,0.0599,0.27,0.1299,0.14,0.4499,0.4699,-0.3199,,-0.0399,-0.4199,1,,,0.0599,0.0199,0.5]
  ]
);

aa.add( 'damage', 3,
  [
    [3,,0.0138,,0.2701,0.4935,,-0.6881,,,,,,,,,,,1,,,,,0.25],
    [0,,0.0639,,0.2425,0.7582,,-0.6217,,,,,,0.4039,,,,,1,,,,,0.25],
    [3,,0.0948,,0.2116,0.7188,,-0.6372,,,,,,,,,,,1,,,0.2236,,0.25],
    [3,,0.1606,0.5988,0.2957,0.1157,,-0.3921,,,,,,,,,0.3225,-0.2522,1,,,,,0.25],
    [3,,0.1726,0.2496,0.2116,0.0623,,-0.2096,,,,,,,,,0.2665,-0.1459,1,,,,,0.25],
    [3,,0.1645,0.7236,0.3402,0.0317,,,,,,,,,,,,,1,,,,,0.25]
  ]
);

aa.add( 'powerup', 10,
  [
    [0,,0.01,,0.4384,0.2,,0.12,0.28,1,0.65,,,0.0419,,,,,1,,,,,0.3]
  ]
);

aa.add( 'monster', 5,
  [
    [3,0.24,0.34,0.39,0.38,0.1674,,0.1216,,0.26,0.47,-0.7772,0.6945,,,0.7945,0.4589,-0.2207,1,,,,,0.46]
  ]
);

aa.add( 'monster-hit', 5,
  [
    [3,,0.356,0.76,0.47,0.1,,0.24,,0.85,0.66,,,,,,0.0291,-0.1671,1,,,,,0.79]
  ]
);

aa.add( 'monster-die', 5,
  [
    //[3,,0.363,0.2436,0.2058,0.079,,0.0624,,,,0.8,0.74,,,,,,1,,,,,0.72]
    [3,0.1,0.42,0.4274,0.2192,0.1281,,-0.18,0.04,,,-0.14,,,,,-0.04,-0.1999,1,-0.0999,,,-0.0999,0.72]
  ]
);
