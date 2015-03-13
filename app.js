(function() {
  var Canvas, Counter, Cup, CupsCounter, CupsCounters, Field, Game, Grid, PropertyMixin, moduleKeywords,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  this.EventMixin = {
    _eventHandlers: function() {
      return this.__eventHandlers || (this.__eventHandlers = {});
    },
    _getHandlers: function(name) {
      var base;
      (base = this._eventHandlers())[name] || (base[name] = []);
      return this._eventHandlers()[name];
    },
    _setHandlers: function(name, value) {
      var base;
      (base = this._eventHandlers())[name] || (base[name] = value);
    },
    on: function(name, callback) {
      if (!callback) {
        return;
      }
      return this._getHandlers(name).push(callback);
    },
    off: function(name, callback) {
      if (!callback) {
        this._setHandlers(name, []);
      } else {
        this._setHandlers(name, this._getHandlers(name).filter(function(c) {
          return c === callback;
        }));
      }
    },
    trigger: function() {
      var args, cb, j, len, name, ref;
      name = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      ref = this._getHandlers(name);
      for (j = 0, len = ref.length; j < len; j++) {
        cb = ref[j];
        cb.apply(this, args);
      }
    }
  };

  moduleKeywords = ['extended', 'included'];

  this.Module = (function() {
    function Module() {}

    Module.extend = function(obj) {
      var key, ref, value;
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(moduleKeywords, key) < 0) {
          this[key] = value;
        }
      }
      if ((ref = obj.extended) != null) {
        ref.apply(this);
      }
      return this;
    };

    Module.include = function(obj) {
      var key, ref, value;
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(moduleKeywords, key) < 0) {
          this.prototype[key] = value;
        }
      }
      if ((ref = obj.included) != null) {
        ref.apply(this);
      }
      return this;
    };

    return Module;

  })();


  /*
   * Elegant pattern to simulate namespace in CoffeeScript
  #
   * @author Maks
   */

  (function(root) {
    var fn;
    fn = function() {
      var Class, args, name, obj, subpackage, target;
      args = arguments[0];
      target = root;
      while (true) {
        for (subpackage in args) {
          obj = args[subpackage];
          target = target[subpackage] || (target[subpackage] = {});
          args = obj;
        }
        if (typeof args !== 'object') {
          break;
        }
      }
      Class = args;
      if (arguments[0].hasOwnProperty('global')) {
        target = root;
      }
      name = Class.toString().match(/^function\s(\w+)\(/)[1];
      return target[name] = Class;
    };
    root.namespace = fn;
    return root.module = fn;
  })(typeof global !== "undefined" && global !== null ? global : window);

  PropertyMixin = {
    property: function(prop, options) {
      return Object.defineProperty(this.prototype, prop, options);
    },
    addProperty: function() {
      var cbs, name;
      name = arguments[0], cbs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return this.property(name, {
        get: function() {
          return this["_" + name];
        },
        set: function(value) {
          var cb, j, len, n, r;
          n = "set" + (name.capitalize());
          if (this[n] != null) {
            r = this[n](value);
          } else {
            r = this.setProp(name, value);
          }
          for (j = 0, len = cbs.length; j < len; j++) {
            cb = cbs[j];
            if (typeof this[cb] === "function") {
              this[cb]();
            }
          }
          return r;
        }
      });
    },
    extended: function() {
      return this.prototype.setProp = function(name, value) {
        if (this["_" + name] !== value) {
          this["_" + name] = value;
          if (typeof this.trigger === "function") {
            this.trigger("change:" + name, this["_" + name]);
          }
        }
        return this["_" + name];
      };
    }
  };

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

  this.ViewMixin = {
    $: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (this.$el) {
        return $.apply($, args.concat([this.$el]));
      } else {
        return $.apply($, args);
      }
    },
    setElement: function(el) {
      this.$el = $(el);
      this.el = this.$el[0];
      return this.setUI();
    },
    setUI: function() {
      var key, ref, results, tmp, value;
      this.ui = {};
      ref = this.constructor.prototype.ui;
      results = [];
      for (key in ref) {
        value = ref[key];
        tmp = this.ui["$" + key] = this.$(value);
        results.push(this.ui[key] = tmp[0]);
      }
      return results;
    }
  };

  namespace({
    models: Cup = (function(superClass) {
      extend(Cup, superClass);

      Cup.extend(PropertyMixin);

      Cup.include(EventMixin);

      Cup.addProperty('row');

      Cup.addProperty('col');

      Cup.addProperty('type');

      Cup.addProperty('selected');

      function Cup(row, col, type) {
        this.row = row;
        this.col = col;
        this.type = type;
        this.selected = false;
      }

      return Cup;

    })(Module)
  });

  namespace({
    models: CupsCounter = (function(superClass) {
      extend(CupsCounter, superClass);

      CupsCounter.extend(PropertyMixin);

      CupsCounter.include(EventMixin);

      CupsCounter.addProperty('all', 'checkDone');

      CupsCounter.addProperty('score', 'checkDone');

      CupsCounter.addProperty('done');

      function CupsCounter(name1, all) {
        this.name = name1;
        this.all = all;
        this.score = 0;
      }

      CupsCounter.prototype.checkDone = function() {
        return this.done = this.all <= this.score;
      };

      return CupsCounter;

    })(Module)
  });

  namespace({
    models: Game = (function(superClass) {
      extend(Game, superClass);

      Game.extend(PropertyMixin);

      Game.include(EventMixin);

      Game.addProperty('score');

      Game.addProperty('moves', 'checkFail');

      Game.addProperty('width');

      Game.addProperty('height');

      Game.addProperty('types');

      Game.addProperty('win');

      Game.addProperty('fail');

      Game.addProperty('lock');

      function Game(options) {
        this.checkWinHandler = _.bind(this.checkWin, this);
        this.setOptions(options);
        this.reset();
        this.grid = new models.Grid(this);
        this.grid.on('change', (function(_this) {
          return function() {
            return _this.trigger('change:grid');
          };
        })(this));
        this.grid.on('change:lock', (function(_this) {
          return function(value) {
            return _this.lock = value;
          };
        })(this));
      }

      Game.prototype.reset = function() {
        this.score = 0;
        this.win = false;
        this.fail = false;
        return this.lock = false;
      };

      Game.prototype.setOptions = function(options) {
        this.height = options.height;
        this.width = options.width;
        this.moves = options.moves;
        this.types = options.types;
        return this.setTargets(options.targets);
      };

      Game.prototype.setTargets = function(targets) {
        var base, key, ref, results, value;
        if (this.targets) {
          ref = this.targets;
          for (key in ref) {
            value = ref[key];
            value.off('change:done', this.checkWinHandler);
          }
        }
        this.counters = this.targets = {};
        results = [];
        for (key in targets) {
          value = targets[key];
          this.targets[key] = new models.CupsCounter(key, value);
          results.push(typeof (base = this.targets[key]).on === "function" ? base.on('change:done', this.checkWinHandler) : void 0);
        }
        return results;
      };

      Game.prototype.checkWin = function() {
        var key, ref, value, w;
        w = true;
        ref = this.targets;
        for (key in ref) {
          value = ref[key];
          w && (w = value.done);
        }
        return this.win = w;
      };

      Game.prototype.checkFail = function() {
        return this.fail = this.fail || this.moves <= 0;
      };

      return Game;

    })(Module)
  });

  namespace({
    models: Grid = (function(superClass) {
      extend(Grid, superClass);

      Grid.extend(PropertyMixin);

      Grid.include(EventMixin);

      Grid.addProperty('lock');

      function Grid(model) {
        this.model = model;
        this.init();
      }

      Grid.prototype.init = function() {
        var col, j, k, len, len1, ref, ref1, row, v;
        this.empty();
        ref = this.grid;
        for (row = j = 0, len = ref.length; j < len; row = ++j) {
          v = ref[row];
          ref1 = this.grid[row];
          for (col = k = 0, len1 = ref1.length; k < len1; col = ++k) {
            v = ref1[col];
            this.grid[row][col] = this.newCup(row, col);
          }
        }
        return this.trigger('change');
      };

      Grid.prototype.empty = function() {
        var index, j, len, ref, results, value;
        this.grid = new Array(this.model.height);
        ref = this.grid;
        results = [];
        for (index = j = 0, len = ref.length; j < len; index = ++j) {
          value = ref[index];
          results.push(this.grid[index] = new Array(this.model.width));
        }
        return results;
      };

      Grid.prototype.randomType = function() {
        return this.model.types[Math.random() * this.model.types.length | 0];
      };

      Grid.prototype.newCup = function(row, col) {
        var cup;
        cup = new models.Cup(row, col, this.randomType());
        cup.on('click', (function(_this) {
          return function() {
            return _this.onCupClick(cup);
          };
        })(this));
        return cup;
      };

      Grid.prototype.eachCups = function(cb) {
        var cup, j, len, ref, results, row, x, y;
        ref = this.grid;
        results = [];
        for (y = j = 0, len = ref.length; j < len; y = ++j) {
          row = ref[y];
          results.push((function() {
            var k, len1, results1;
            results1 = [];
            for (x = k = 0, len1 = row.length; k < len1; x = ++k) {
              cup = row[x];
              results1.push(typeof cb === "function" ? cb(cup, x, y) : void 0);
            }
            return results1;
          })());
        }
        return results;
      };

      Grid.prototype.onCupClick = function(cup) {
        if (this.lock) {
          return;
        }
        if (this.selected) {
          if (this.isNear(this.selected, cup)) {
            this.swap(this.selected, cup);
            return this.selected = null;
          } else {
            cup.selected = !cup.selected;
            if (cup !== this.selected) {
              this.selected.selected = false;
              return this.selected = cup;
            } else {
              return this.selected = null;
            }
          }
        } else {
          cup.selected = !cup.selected;
          return this.selected = cup;
        }
      };

      Grid.prototype.isNear = function(c1, c2) {
        return (c1.row === c2.row && Math.abs(c1.col - c2.col) === 1) || (c1.col === c2.col && Math.abs(c1.row - c2.row) === 1);
      };

      Grid.prototype.isRight = function(c1, c2) {
        return c1 > c2;
      };

      Grid.prototype.isLeft = function(c1, c2) {
        return c1 < c2;
      };

      Grid.prototype.isTop = function(r1, r2) {
        return r1 < r2;
      };

      Grid.prototype.isBottom = function(r1, r2) {
        return r1 > r2;
      };

      Grid.prototype.hasMatches = function() {
        return Boolean(Math.random() * 2 | 0);
      };

      Grid.prototype.swap = function(c1, c2) {
        var animHandlers;
        animHandlers = function() {
          return [_.bind(c1.view.move, c1.view, c2.row, c2.col), _.bind(c2.view.move, c2.view, c1.row, c1.col)];
        };
        this.startSwap(c1, c2);
        return async.parallel(animHandlers(), (function(_this) {
          return function() {
            _this.doSwap(c1, c2);
            if (!_this.hasMatches()) {
              return async.parallel(animHandlers(), function() {
                _this.doSwap(c1, c2);
                return _this.endSwap(c1, c2);
              });
            } else {
              return _this.endSwap(c1, c2);
            }
          };
        })(this));
      };

      Grid.prototype.startSwap = function(c1, c2) {
        this.lock = true;
        c1.selected = true;
        return c2.selected = true;
      };

      Grid.prototype.endSwap = function(c1, c2) {
        c1.selected = false;
        c2.selected = false;
        return this.lock = false;
      };

      Grid.prototype.doSwap = function(c1, c2) {
        var c, r, ref, ref1, ref2;
        this.grid[c1.row][c1.col] = c2;
        this.grid[c2.row][c2.col] = c1;
        ref = [c2.row, c2.col], r = ref[0], c = ref[1];
        ref1 = [c1.row, c1.col], c2.row = ref1[0], c2.col = ref1[1];
        ref2 = [r, c], c1.row = ref2[0], c1.col = ref2[1];
        return this.trigger('change');
      };

      return Grid;

    })(Module)
  });

  namespace({
    ui: Canvas = (function(superClass) {
      extend(Canvas, superClass);

      Canvas.extend(PropertyMixin);

      Canvas.include(ViewMixin);

      Canvas.include(EventMixin);

      Canvas.addProperty('model');

      Canvas.addProperty('cellSize');

      Canvas.property('width', {
        get: function() {
          return this.el.width;
        },
        set: function(val) {
          return this.el.width = val;
        }
      });

      Canvas.property('height', {
        get: function() {
          return this.el.height;
        },
        set: function(val) {
          return this.el.height = val;
        }
      });

      Canvas.property('handlers', {
        get: function() {
          return this._handlers != null ? this._handlers : this._handlers = {
            onTick: _.bind(this.tick, this),
            onUpdateGrid: _.bind(this.updateGrid, this)
          };
        }
      });

      function Canvas(el, model) {
        this.setElement(el);
        this.model = model;
        this.stage = new createjs.Stage(this.el);
        this.resetSize();
        this.initHandlers();
        this.updateGrid();
      }

      Canvas.prototype.initHandlers = function() {
        createjs.Ticker.addEventListener('tick', this.handlers.onTick);
        return this.model.on('change:grid', this.handlers.onUpdateGrid);
      };

      Canvas.prototype.resetSize = function() {
        var ch, cs, cw, h, w;
        this.width = this.$el.width();
        this.height = this.$el.height();
        cw = this.width / (this.model.width + 2);
        ch = this.height / (this.model.height + 2);
        cs = cw < ch ? cw : ch;
        w = cs * this.model.width;
        h = cs * this.model.height;
        this.stage.set({
          regX: (w - this.width) / 2,
          regY: (h - this.height) / 2
        });
        return this.cellSize = cs;
      };

      Canvas.prototype.updateGrid = function() {
        return this.model.grid.eachCups((function(_this) {
          return function(cup, x, y) {
            if (cup.view == null) {
              cup.view = new ui.Cup(x, y, _this.cellSize, cup);
            }
            return _this.stage.addChild(cup.view.shape);
          };
        })(this));
      };

      Canvas.prototype.tick = function(event) {
        return this.stage.update(event);
      };

      return Canvas;

    })(Module)
  });

  namespace({
    ui: Counter = (function(superClass) {
      extend(Counter, superClass);

      Counter.extend(PropertyMixin);

      Counter.include(ViewMixin);

      Counter.addProperty('value');

      Counter.addProperty('model');

      function Counter(el, prop1, model) {
        this.prop = prop1;
        this.setElement(el);
        this.model = model;
      }

      Counter.prototype.setValue = function(value) {
        this._value = Number(value);
        this.$el.text(this._value);
        return this._value;
      };

      Counter.prototype.setModel = function(model) {
        var base, base1;
        if (this._handler == null) {
          this._handler = _.bind(this.setValue, this);
        }
        if (this._model) {
          if (typeof (base = this._model).off === "function") {
            base.off("change:" + this.prop, this._handler);
          }
        }
        this._model = model;
        if (!this._model) {
          this.value = 0;
          return this._model;
        }
        this.value = this._model[this.prop];
        if (typeof (base1 = this._model).on === "function") {
          base1.on("change:" + this.prop, this._handler);
        }
        return this._model;
      };

      return Counter;

    })(Module)
  });

  namespace({
    ui: Cup = (function(superClass) {
      extend(Cup, superClass);

      Cup.extend(PropertyMixin);

      Cup.include(EventMixin);

      Cup.prototype.anim = {
        delay: 400,
        type: createjs.Ease.circInOut
      };

      Cup.prototype.colors = {
        red: "#F15A5A",
        yellow: "#F0C419",
        green: "#4EBA6F",
        blue: "#2D95BF",
        magenta: "#955BA5"
      };

      Cup.prototype.darkenColors = {
        red: "#CB3434",
        yellow: "#CA9E00",
        green: "#289449",
        blue: "#076F99",
        magenta: "#6F357F"
      };

      Cup.addProperty('x', 'setShapeX');

      Cup.addProperty('y', 'setShapeY');

      Cup.addProperty('size', 'calc');

      Cup.addProperty('radius', 'draw');

      Cup.addProperty('color', 'draw');

      Cup.addProperty('darkenColor', 'draw');

      Cup.addProperty('shape', 'draw');

      Cup.prototype.shadow = new createjs.Shadow('#000', 0, 0, 5, 2);

      function Cup(cx, cy, size, model) {
        this.model = model;
        this.size = size;
        this.shape = new createjs.Shape;
        this.shape.set({
          snapToPixel: true,
          x: this.x,
          y: this.y
        });
        this.shape.addEventListener('click', (function(_this) {
          return function() {
            return _this.model.trigger('click');
          };
        })(this));
        this.model.on('change:selected', (function(_this) {
          return function() {
            return _this.draw();
          };
        })(this));
        this.model.on('change:col', (function(_this) {
          return function() {
            return _this.calc();
          };
        })(this));
        this.model.on('change:row', (function(_this) {
          return function() {
            return _this.calc();
          };
        })(this));
      }

      Cup.prototype.calcX = function(col) {
        return col * this.size + this.size / 2;
      };

      Cup.prototype.calcY = function(row) {
        return row * this.size + this.size / 2;
      };

      Cup.prototype.calc = function() {
        this.cellX = this.model.col;
        this.cellY = this.model.row;
        this.x = this.calcX(this.cellX);
        this.y = this.calcY(this.cellY);
        this.radius = this.size * 0.7 / 2;
        this.color = this.colors[this.model.type];
        return this.darkenColor = this.darkenColors[this.model.type];
      };

      Cup.prototype.draw = function() {
        if (!this.shape) {
          return;
        }
        this.shape.graphics.clear();
        if (this.model.selected) {
          return this.shape.graphics.beginFill(this.darkenColor).drawCircle(0, 0, this.radius).beginFill(this.color).drawCircle(0, 0, this.radius * 0.70);
        } else {
          return this.shape.graphics.beginFill(this.color).drawCircle(0, 0, this.radius);
        }
      };

      Cup.prototype.setShapeX = function() {
        var ref;
        return (ref = this.shape) != null ? ref.x = this.x : void 0;
      };

      Cup.prototype.setShapeY = function() {
        var ref;
        return (ref = this.shape) != null ? ref.y = this.y : void 0;
      };

      Cup.prototype.move = function(col, row, cb) {
        var x, y;
        x = this.calcX(row);
        y = this.calcY(col);
        return createjs.Tween.get(this.shape).to({
          x: x,
          y: y
        }, this.anim.delay, this.anim.type).call(cb);
      };

      return Cup;

    })(Module)
  });

  namespace({
    ui: CupsCounter = (function(superClass) {
      extend(CupsCounter, superClass);

      CupsCounter.extend(PropertyMixin);

      CupsCounter.include(ViewMixin);

      CupsCounter.addProperty('score', 'scoreCallback');

      CupsCounter.addProperty('all', 'allCallback');

      CupsCounter.addProperty('done', 'doneCallback');

      CupsCounter.addProperty('visible', 'visibleCallback');

      CupsCounter.addProperty('model');

      CupsCounter.prototype.ui = {
        score: '.CupScore',
        all: '.All'
      };

      function CupsCounter(el, model) {
        this.setElement(el);
        this.name = this.$el.data('name');
        this.model = model;
      }

      CupsCounter.prototype.show = function() {
        return this.$el.show();
      };

      CupsCounter.prototype.hide = function() {
        return this.$el.hide();
      };

      CupsCounter.prototype.scoreCallback = function() {
        return this.ui.$score.text(this.score);
      };

      CupsCounter.prototype.allCallback = function() {
        return this.ui.$all.text(this.all);
      };

      CupsCounter.prototype.doneCallback = function() {
        return this.$el.toggleClass('done', this.done);
      };

      CupsCounter.prototype.visibleCallback = function() {
        if (this.visible) {
          return this.show();
        } else {
          return this.hide();
        }
      };

      CupsCounter.prototype.setModel = function(model) {
        var base, base1, key, ref, ref1, value;
        if (this._handlers == null) {
          this._handlers = {
            score: _.bind((function(value) {
              return this.score = value;
            }), this),
            all: _.bind((function(value) {
              return this.all = value;
            }), this),
            done: _.bind((function(value) {
              return this.done = value;
            }), this)
          };
        }
        if (this._model) {
          ref = this._handlers;
          for (key in ref) {
            value = ref[key];
            if (typeof (base = this._model).off === "function") {
              base.off("change:" + key, value);
            }
          }
        }
        this._model = model;
        if (!this._model) {
          this.all = 0;
          this.score = 0;
          this.done = false;
          this.visible = false;
          return this._model;
        }
        this.all = this._model.all;
        this.score = this._model.score;
        this.done = this._model.done;
        this.visible = true;
        ref1 = this._handlers;
        for (key in ref1) {
          value = ref1[key];
          if (typeof (base1 = this._model).on === "function") {
            base1.on("change:" + key, value);
          }
        }
        return this._model;
      };

      return CupsCounter;

    })(Module)
  });

  namespace({
    ui: CupsCounters = (function(superClass) {
      extend(CupsCounters, superClass);

      CupsCounters.extend(PropertyMixin);

      CupsCounters.include(ViewMixin);

      CupsCounters.addProperty('model');

      CupsCounters.prototype.ui = {
        counters: '.CupsCounter'
      };

      function CupsCounters(el, model) {
        this.setElement(el);
        this.counters = {};
        this.ui.$counters.each((function(_this) {
          return function(i, el) {
            var counter;
            counter = new ui.CupsCounter(el);
            return _this.counters[counter.name] = counter;
          };
        })(this));
        this.model = model;
      }

      CupsCounters.prototype.setModel = function(model) {
        var key, ref, ref1, results, value;
        this._model = model;
        if (!model) {
          return this._model;
        }
        ref = this._model.counters;
        results = [];
        for (key in ref) {
          value = ref[key];
          results.push((ref1 = this.counters[key]) != null ? ref1.model = value : void 0);
        }
        return results;
      };

      return CupsCounters;

    })(Module)
  });

  namespace({
    ui: Field = (function(superClass) {
      extend(Field, superClass);

      Field.include(ViewMixin);

      Field.prototype.ui = {
        score: '.Score',
        moves: '.Moves',
        counters: '.CupsCounters',
        canvas: '.Canvas'
      };

      function Field(game) {
        this.game = game;
        this.setUI();
        this.cupCounters = new ui.CupsCounters(this.ui.counters, this.game);
        this.moves = new ui.Counter(this.ui.moves, 'moves', this.game);
        this.score = new ui.Counter(this.ui.score, 'score', this.game);
        this.canvas = new ui.Canvas(this.ui.canvas, this.game);
        this.game.on('change:moves', (function(_this) {
          return function(moves) {
            return _this.ui.$moves.toggleClass('attention', moves <= 5);
          };
        })(this));
        this.game.on('change:win', (function(_this) {
          return function(win) {
            if (win) {
              alert('Win!');
              return window.location = window.location;
            }
          };
        })(this));
        this.game.on('change:fail', (function(_this) {
          return function(fail) {
            if (fail) {
              alert('Fail!');
              return window.location = window.location;
            }
          };
        })(this));
      }

      return Field;

    })(Module)
  });

  $((function(_this) {
    return function() {
      return _this.field = new ui.Field(new models.Game({
        width: 6,
        height: 6,
        moves: 40,
        types: ['red', 'green', 'blue', 'yellow'],
        targets: {
          red: 10,
          green: 10,
          blue: 10
        }
      }));
    };
  })(this));

}).call(this);

//# sourceMappingURL=app.js.map
