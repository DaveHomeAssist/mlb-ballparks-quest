(function (global) {
  'use strict';

  var BPQ = global.BPQ = global.BPQ || {};

  function cloneRunner(runner) {
    if (!runner) return null;
    return {
      id: runner.id,
      batterId: runner.batterId,
      reachedOn: runner.reachedOn,
      reachedInning: runner.reachedInning,
      cellRef: runner.cellRef ? { batter: runner.cellRef.batter, inning: runner.cellRef.inning } : null
    };
  }

  function cloneBases(bases) {
    return {
      first: cloneRunner(bases && bases.first),
      second: cloneRunner(bases && bases.second),
      third: cloneRunner(bases && bases.third)
    };
  }

  function emptyBases() {
    return { first: null, second: null, third: null };
  }

  function makeResult(nextBases, runs, outsAdded, moves, warnings) {
    return {
      bases: nextBases,
      nextBases: nextBases,
      runsScored: runs || 0,
      outsAdded: outsAdded || 0,
      moves: moves || [],
      runnerMoves: moves || [],
      warnings: warnings || []
    };
  }

  function forceWalk(bases, batterRunner) {
    var next = cloneBases(bases);
    var runs = 0;
    var moves = [];

    if (next.first && next.second && next.third) {
      runs += 1;
      moves.push({ from: 'third', to: 'home', safe: true, runnerId: next.third.id });
    }

    if (next.second && next.first) {
      moves.push({ from: 'second', to: 'third', safe: true, runnerId: next.second.id });
      next.third = next.second;
    }
    if (next.first) {
      moves.push({ from: 'first', to: 'second', safe: true, runnerId: next.first.id });
      next.second = next.first;
    }

    next.first = cloneRunner(batterRunner);
    moves.push({ from: 'batter', to: 'first', safe: true, runnerId: batterRunner && batterRunner.id ? batterRunner.id : null });

    return makeResult(next, runs, 0, moves, []);
  }

  function resolveSingle(bases, batterRunner) {
    var next = emptyBases();
    var runs = 0;
    var moves = [];

    if (bases.third) {
      runs += 1;
      moves.push({ from: 'third', to: 'home', safe: true, runnerId: bases.third.id });
    }
    if (bases.second) {
      next.third = cloneRunner(bases.second);
      moves.push({ from: 'second', to: 'third', safe: true, runnerId: bases.second.id });
    }
    if (bases.first) {
      next.second = cloneRunner(bases.first);
      moves.push({ from: 'first', to: 'second', safe: true, runnerId: bases.first.id });
    }

    next.first = cloneRunner(batterRunner);
    moves.push({ from: 'batter', to: 'first', safe: true, runnerId: batterRunner && batterRunner.id ? batterRunner.id : null });

    return makeResult(next, runs, 0, moves, []);
  }

  function resolveDouble(bases, batterRunner) {
    var next = emptyBases();
    var runs = 0;
    var moves = [];

    if (bases.third) {
      runs += 1;
      moves.push({ from: 'third', to: 'home', safe: true, runnerId: bases.third.id });
    }
    if (bases.second) {
      runs += 1;
      moves.push({ from: 'second', to: 'home', safe: true, runnerId: bases.second.id });
    }
    if (bases.first) {
      next.third = cloneRunner(bases.first);
      moves.push({ from: 'first', to: 'third', safe: true, runnerId: bases.first.id });
    }

    next.second = cloneRunner(batterRunner);
    moves.push({ from: 'batter', to: 'second', safe: true, runnerId: batterRunner && batterRunner.id ? batterRunner.id : null });

    return makeResult(next, runs, 0, moves, []);
  }

  function resolveTriple(bases, batterRunner) {
    var next = emptyBases();
    var runs = 0;
    var moves = [];

    if (bases.third) {
      runs += 1;
      moves.push({ from: 'third', to: 'home', safe: true, runnerId: bases.third.id });
    }
    if (bases.second) {
      runs += 1;
      moves.push({ from: 'second', to: 'home', safe: true, runnerId: bases.second.id });
    }
    if (bases.first) {
      runs += 1;
      moves.push({ from: 'first', to: 'home', safe: true, runnerId: bases.first.id });
    }

    next.third = cloneRunner(batterRunner);
    moves.push({ from: 'batter', to: 'third', safe: true, runnerId: batterRunner && batterRunner.id ? batterRunner.id : null });

    return makeResult(next, runs, 0, moves, []);
  }

  function resolveHomeRun(bases, batterRunner) {
    var next = emptyBases();
    var runs = 0;
    var moves = [];

    if (bases.third) {
      runs += 1;
      moves.push({ from: 'third', to: 'home', safe: true, runnerId: bases.third.id });
    }
    if (bases.second) {
      runs += 1;
      moves.push({ from: 'second', to: 'home', safe: true, runnerId: bases.second.id });
    }
    if (bases.first) {
      runs += 1;
      moves.push({ from: 'first', to: 'home', safe: true, runnerId: bases.first.id });
    }

    runs += 1;
    moves.push({ from: 'batter', to: 'home', safe: true, runnerId: batterRunner && batterRunner.id ? batterRunner.id : null });

    return makeResult(next, runs, 0, moves, []);
  }

  function resolveStrikeout(bases) {
    return makeResult(cloneBases(bases), 0, 1, [], []);
  }

  function resolveFlyOut(bases) {
    return makeResult(cloneBases(bases), 0, 1, [], []);
  }

  function resolveSacFly(bases) {
    if (!bases.third) {
      var fallback = resolveFlyOut(bases);
      fallback.warnings = ['Sac fly selected with no runner on third'];
      return fallback;
    }
    var next = cloneBases(bases);
    var moves = [{ from: 'third', to: 'home', safe: true, runnerId: bases.third.id }];
    next.third = null;
    return makeResult(next, 1, 1, moves, []);
  }

  function resolveGroundOut(bases) {
    return makeResult(cloneBases(bases), 0, 1, [], ['Default ground out keeps runners in place']);
  }

  function resolveDoublePlay(bases) {
    if (!bases.first) {
      var fallback = resolveGroundOut(bases);
      fallback.warnings = ['Double play selected with no runner on first'];
      return fallback;
    }
    var next = cloneBases(bases);
    var moves = [{ from: 'first', to: 'out', safe: false, runnerId: bases.first.id }];
    next.first = null;
    return makeResult(next, 0, 2, moves, []);
  }

  function resolveFieldersChoice(bases, batterRunner) {
    var next = cloneBases(bases);
    var warnings = [];
    var moves = [];
    if (next.first) {
      moves.push({ from: 'first', to: 'out', safe: false, runnerId: next.first.id });
      next.first = cloneRunner(batterRunner);
      moves.push({ from: 'batter', to: 'first', safe: true, runnerId: batterRunner && batterRunner.id ? batterRunner.id : null });
      return makeResult(next, 0, 1, moves, warnings);
    }
    if (next.second) {
      moves.push({ from: 'second', to: 'out', safe: false, runnerId: next.second.id });
      next.second = null;
      next.first = cloneRunner(batterRunner);
      moves.push({ from: 'batter', to: 'first', safe: true, runnerId: batterRunner && batterRunner.id ? batterRunner.id : null });
      warnings.push('Fielder choice defaulted to runner from second out');
      return makeResult(next, 0, 1, moves, warnings);
    }
    warnings.push('Fielder choice selected with no force situation');
    return makeResult(cloneBases(bases), 0, 0, [], warnings);
  }

  function resolveError(bases, batterRunner) {
    var result = forceWalk(bases, batterRunner);
    result.warnings = ['Error defaults to batter safe at first with forced advancement only'];
    return result;
  }

  function highestOccupiedBase(bases) {
    if (bases.third) return 'third';
    if (bases.second) return 'second';
    if (bases.first) return 'first';
    return null;
  }

  function nextBaseName(base) {
    if (base === 'first') return 'second';
    if (base === 'second') return 'third';
    if (base === 'third') return 'home';
    return null;
  }

  function resolveStolenBase(bases, options) {
    var from = options && options.from ? options.from : highestOccupiedBase(bases);
    if (!from || !bases[from]) return makeResult(cloneBases(bases), 0, 0, [], ['No runner available for stolen base']);
    var to = nextBaseName(from);
    var next = cloneBases(bases);
    var runner = next[from];
    next[from] = null;
    var runs = 0;
    if (to === 'home') {
      runs = 1;
    } else {
      next[to] = runner;
    }
    return makeResult(next, runs, 0, [{ from: from, to: to, safe: true, runnerId: runner.id }], []);
  }

  function resolveCaughtStealing(bases, options) {
    var from = options && options.from ? options.from : highestOccupiedBase(bases);
    if (!from || !bases[from]) return makeResult(cloneBases(bases), 0, 0, [], ['No runner available for caught stealing']);
    var next = cloneBases(bases);
    var runner = next[from];
    next[from] = null;
    return makeResult(next, 0, 1, [{ from: from, to: 'out', safe: false, runnerId: runner.id }], []);
  }

  function resolveWildPitch(bases, options) {
    var next = cloneBases(bases);
    var moves = [];
    var runs = 0;
    var targets = options && Array.isArray(options.advance) && options.advance.length
      ? options.advance.slice()
      : ['third', 'second', 'first'];

    targets.forEach(function (from) {
      if (!next[from]) return;
      var runner = next[from];
      var to = nextBaseName(from);
      next[from] = null;
      if (to === 'home') {
        runs += 1;
      } else {
        next[to] = runner;
      }
      moves.push({ from: from, to: to, safe: true, runnerId: runner.id });
    });

    return makeResult(next, runs, 0, moves, []);
  }

  function resolvePlay(playType, state, batterRunner, options) {
    var bases = cloneBases(state && state.bases ? state.bases : emptyBases());
    switch (playType) {
      case '1B': return resolveSingle(bases, batterRunner);
      case '2B': return resolveDouble(bases, batterRunner);
      case '3B': return resolveTriple(bases, batterRunner);
      case 'HR': return resolveHomeRun(bases, batterRunner);
      case 'BB':
      case 'HBP': return forceWalk(bases, batterRunner);
      case 'K': return resolveStrikeout(bases);
      case 'FO': return resolveFlyOut(bases);
      case 'SF': return resolveSacFly(bases);
      case 'GO': return resolveGroundOut(bases);
      case 'DP': return resolveDoublePlay(bases);
      case 'FC': return resolveFieldersChoice(bases, batterRunner);
      case 'E': return resolveError(bases, batterRunner);
      case 'SB': return resolveStolenBase(bases, options || {});
      case 'CS': return resolveCaughtStealing(bases, options || {});
      case 'WP': return resolveWildPitch(bases, options || {});
      default:
        throw new Error('Unknown play type: ' + playType);
    }
  }

  function normalizeScorekeeperCode(code) {
    var normalized = String(code || '').trim().toUpperCase();
    if (!normalized) return null;
    if (normalized === 'Ʞ') return 'K';
    if (normalized === 'FO' || normalized === 'F7' || normalized === 'F8' || normalized === 'F9') return 'FO';
    if (normalized === 'GO' || normalized === '6-3' || normalized === '5-3' || normalized === '4-3' || normalized === '1-3' || normalized === '3-1') return 'GO';
    if (normalized === 'DP' || normalized.indexOf('DP') === 0) return 'DP';
    if (normalized === 'E' || /^E\d$/.test(normalized)) return 'E';
    if (normalized === '1B' || normalized === '2B' || normalized === '3B' || normalized === 'HR' ||
        normalized === 'BB' || normalized === 'HBP' || normalized === 'K' || normalized === 'SF' ||
        normalized === 'FC' || normalized === 'SB' || normalized === 'CS' || normalized === 'WP') {
      return normalized;
    }
    return null;
  }

  BPQ.resolver = {
    cloneBases: cloneBases,
    emptyBases: emptyBases,
    forceWalk: forceWalk,
    resolveSingle: resolveSingle,
    resolveDouble: resolveDouble,
    resolveTriple: resolveTriple,
    resolveHomeRun: resolveHomeRun,
    resolveStrikeout: resolveStrikeout,
    resolveFlyOut: resolveFlyOut,
    resolveSacFly: resolveSacFly,
    resolveGroundOut: resolveGroundOut,
    resolveDoublePlay: resolveDoublePlay,
    resolveFieldersChoice: resolveFieldersChoice,
    resolveError: resolveError,
    resolveStolenBase: resolveStolenBase,
    resolveCaughtStealing: resolveCaughtStealing,
    resolveWildPitch: resolveWildPitch,
    resolvePlay: resolvePlay,
    normalizeScorekeeperCode: normalizeScorekeeperCode
  };
})(window);
