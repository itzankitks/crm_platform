export const parseExpression = (expression: string): any => {
  if (!expression) return {};

  expression = expression.replace(/\s+/g, " ").trim();

  expression = expression.replace(
    /(\d+)\s+(?=\w+\s*[><=!])/g,
    (match) => `${match} AND `
  );

  const tokens = expression.split(/\s+(AND|OR)\s+/);

  const conditions: any[] = [];
  let currentLogic: "AND" | "OR" = "AND";

  for (let token of tokens) {
    token = token.trim();
    if (!token) continue;

    if (token === "AND" || token === "OR") {
      currentLogic = token as "AND" | "OR";
      continue;
    }

    const match = token.match(/(\w+)\s*(>=|<=|!=|>|<|=)\s*(.+)/);
    if (!match) continue;

    const [, field, operator, rawValue] = match;
    let value: any = rawValue.trim().replace(/^"|"$/g, "");

    if (field === "lastActiveAt") {
      value = new Date(value);
    } else if (!isNaN(Number(value))) {
      value = Number(value);
    }

    let condition: any = {};
    switch (operator) {
      case ">":
        condition[field] = { $gt: value };
        break;
      case "<":
        condition[field] = { $lt: value };
        break;
      case ">=":
        condition[field] = { $gte: value };
        break;
      case "<=":
        condition[field] = { $lte: value };
        break;
      case "=":
        condition[field] = value;
        break;
      case "!=":
        condition[field] = { $ne: value };
        break;
    }

    conditions.push({ logic: currentLogic, condition });
  }

  if (conditions.length === 0) return {};

  let query: any = conditions[0].condition;
  for (let i = 1; i < conditions.length; i++) {
    const { logic, condition } = conditions[i];
    if (logic === "AND") {
      query = { $and: [query, condition] };
    } else {
      query = { $or: [query, condition] };
    }
  }

  return query;
};
