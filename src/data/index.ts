import base from './base.dat'
import cc from './cc.dat'
import check from './check.dat'
import tid from './tid.dat'
import tid_map from './tid_map.dat'
import tid_pos from './tid_pos.dat'
import unk from './unk.dat'
import unk_char from './unk_char.dat'
import unk_compat from './unk_compat.dat'
import unk_invoke from './unk_invoke.dat'
import unk_map from './unk_map.dat'
import unk_pos from './unk_pos.dat'

export const dataFiles = [
  { name: 'base.dat', data: base },
  { name: 'cc.dat', data: cc },
  { name: 'check.dat', data: check },
  { name: 'tid.dat', data: tid },
  { name: 'tid_map.dat', data: tid_map },
  { name: 'tid_pos.dat', data: tid_pos },
  { name: 'unk.dat', data: unk },
  { name: 'unk_char.dat', data: unk_char },
  { name: 'unk_compat.dat', data: unk_compat },
  { name: 'unk_invoke.dat', data: unk_invoke },
  { name: 'unk_map.dat', data: unk_map },
  { name: 'unk_pos.dat', data: unk_pos },
];
