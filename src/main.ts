import { h, init } from 'snabbdom';
import { VNode } from 'snabbdom/vnode';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import klass from 'snabbdom/modules/class';
import attributes from 'snabbdom/modules/attributes';
import listeners from 'snabbdom/modules/eventlisteners';
import style from 'snabbdom/modules/style';

export function run(element: Element) {
  const patch = init([klass, attributes, listeners, style]);

  let cg: Api, vnode: VNode;

  function rerender() {
    vnode = patch(vnode || element, render());
  }

  function drawBoard(vnode: VNode) {
    if(cg) {
      cg.redrawAll();
    } else {
      const el = vnode.elm as HTMLElement;
      cg = Chessground(el);
      window['cg'] = cg;
    }
  }

  function render() {
    return h('div#crowdchess', h('div.blue.merida', 
      h('div.cg-board-wrap', {
        style: {
          width: '700px',
          height: '700px'
        },
        hook: {
          insert: drawBoard,
          postpatch: drawBoard
        }
      })));
  }

  rerender();
}
