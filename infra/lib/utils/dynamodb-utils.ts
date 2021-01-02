import { AttributeValue, PutItemInputAttributeMap } from "aws-sdk/clients/dynamodb";

export function removeUndefinedAttributes(
  item: PutItemInputAttributeMap
): PutItemInputAttributeMap {
  return Object.keys(item).reduce((previous, current) => {
    const currentValue = item[current];
    const currentValueKeys = Object.keys(currentValue);

    if (currentValueKeys.length > 1) {
      throw new Error("Expected only one type for value");
    }

    const onlyKey = currentValueKeys[0] as keyof AttributeValue;
    const onlyValue = currentValue[onlyKey];

    if (onlyValue) {
      return {
        ...previous,
        [current]: {
          [onlyKey]: onlyValue,
        },
      };
    }

    return previous;
  }, {} as PutItemInputAttributeMap);
}
