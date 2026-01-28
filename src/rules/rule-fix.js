// kuromoji sometime returns the wrong word position
// when the previous token is a multiple length symblo
// this rule MUST be placed at the first rule
export const ruleFix = (token) => {
  let currentPosition = -1;
  token.forEach((t) => {
    if (currentPosition === -1) {
      currentPosition = t.word_position;
    } else {
      t.word_position = currentPosition;
    }
    currentPosition += t.surface_form.length;
  });

  return token;
};
