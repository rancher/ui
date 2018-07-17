function getVariables(showIf, operator) {
  if ( showIf.indexOf(operator) > -1 ) {
    const array = showIf.split(operator);

    if ( array.length === 2 ) {
      return {
        left:  array[0],
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

  const and = question.showIf.split('&&');

  const result = and.every((showIf) => {
    showIf = showIf.trim();
    const variables = getVariables(showIf, '=');

    if ( variables ) {
      const left = stringifyAnswer(getAnswer(variables.left, allQuestions));
      const right = stringifyAnswer(variables.right);

      return left === right;
    }

    return false;
  });

  return result;
}

export function stringifyAnswer(answer) {
  if ( answer === undefined || answer === null ) {
    return '';
  } else if ( typeof answer === 'string' ) {
    return answer;
  } else {
    return `${ answer  }`;
  }
}
