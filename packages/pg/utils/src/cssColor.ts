export function classApproved(state) {
  // 通过
  if (state == 'approved') {
    return 'text-green-500';
  }
  //驳回
  if ('rejected' == state) {
    return 'text-red-500';
  }
  return '';
}
