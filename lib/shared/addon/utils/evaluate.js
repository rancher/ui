function getVariables(showIf, operator) {
  if ( showIf.indexOf(operator) > -1 ) {
    const array = showIf.split(operator);
    if ( array.length === 2 ) {
      return {
        left: array[0],
        right: array[1]
      };
    } else {
      return null;
    }
  }
  return null;
}

function getAnswer(variable, questions) {
  const found = questions.find((q) => q.variable === variable);
  if ( found ) {
    return found.answer;
  } else {
    return variable;
  }
}

export function evaluate(question, allQuestions) {
  if ( !question.showIf ) {
    return true;
  }

  const showIf = question.showIf.trim();

  let variables = getVariables(showIf, '=');

  if ( variables ) {
    const left = getAnswer(variables.left, allQuestions);
    const right = variables.right;

    return left === right;
  }

  return false;
}