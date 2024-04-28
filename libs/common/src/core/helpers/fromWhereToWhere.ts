interface IFromWhereToWhereParams {
  from: string;
  to: string;
  routingKey: string;
}

function fromWhereToWhere({ from, to, routingKey }: IFromWhereToWhereParams) {
  return `${from}->${to}:${routingKey}`;
}

export default fromWhereToWhere;
