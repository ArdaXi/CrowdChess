import { h, init } from 'snabbdom';
import { VNode } from 'snabbdom/vnode';
import { Chess } from 'chess.js';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import { Color } from 'chessground/types';
import klass from 'snabbdom/modules/class';
import attributes from 'snabbdom/modules/attributes';
import listeners from 'snabbdom/modules/eventlisteners';
import style from 'snabbdom/modules/style';
import * as chunk from 'array.chunk';

export function run(board: Element, table: Element) {
  const patch = init([klass, attributes, listeners, style]);
  const chess = new Chess();

  let cg: Api, vnode: VNode, tableParent: Element;
  let rerenderTable;

  tableParent = table.parentElement.parentElement;

  function rerender() {
    vnode = patch(vnode || board, renderBoard());
  }

  function drawBoard(vnode: VNode) {
    if(cg) {
      cg.redrawAll();
    } else {
      const el = vnode.elm as HTMLElement;
      cg = Chessground(el, {
        animation: { duration: 1000 },
        movable: {
          color: 'white',
          free: false,
          dests: toDests(chess)
        },
      });
      cg.set({
        movable: { events: { after: playerMove(cg, chess, rerenderTable) } }
      });
      window['cg'] = cg;
    }
  }

  function renderBoard() {
    let height = tableParent.clientHeight;
    let size = board.clientWidth;

    if (height != null && board.clientWidth > height) {
      size = height - 16;
    }

    return h('div#crowdchess', h('div.blue.merida', 
      h('div.cg-board-wrap', {
        style: {
          width: size + 'px',
          height: size + 'px'
        },
        hook: {
          insert: drawBoard,
          postpatch: drawBoard
        }
      })));
  }

  rerenderTable = runTable(chess, table);

  rerender();

  return rerender;
}

function runTable(chess: any, element: Element) {
  const patch = init([klass, attributes, listeners, style]);
  let vnode: VNode;

  function rerender() {
    vnode = patch(vnode || element, renderTable());
  }

  function renderTable() {
    const table = chunk(chess.history(), 2).map(([w, b], n) => h('tr', [
      h('th', n+1),
      h('td', w),
      h('td', b || '...')
    ]));

    return h('table', table);
  }

  return rerender;
}

function toDests(chess: any) {
  const dests = {};
  chess.SQUARES.forEach(s => {
    const ms = chess.moves({square: s, verbose: true});
    if (ms.length) dests[s] = ms.map(m => m.to);
  });
  return dests;
}

function playerMove(cg: Api, chess, cb) {
  return (orig, dest) => {
    chess.move({from: orig, to: dest});
    let turnColor: Color = (chess.turn() === 'w') ? 'white' : 'black';
    cg.set({
      turnColor: turnColor,
      movable: {
        color: turnColor,
        dests: toDests(chess)
      },
      viewOnly: false
    });

    if (cg.state.stats.dragged) {
      setTimeout(cg.toggleOrientation, 100);
    } else {
      setTimeout(cg.toggleOrientation, 1000);
    }
    cb();
  };
}
