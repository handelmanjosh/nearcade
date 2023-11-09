function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object.keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;
  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }
  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);
  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }
  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }
  return desc;
}

// make PromiseIndex a nominal typing
var PromiseIndexBrand;
(function (PromiseIndexBrand) {
  PromiseIndexBrand[PromiseIndexBrand["_"] = -1] = "_";
})(PromiseIndexBrand || (PromiseIndexBrand = {}));
const TYPE_KEY = "typeInfo";
var TypeBrand;
(function (TypeBrand) {
  TypeBrand["BIGINT"] = "bigint";
  TypeBrand["DATE"] = "date";
})(TypeBrand || (TypeBrand = {}));
const ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
const ERR_INDEX_OUT_OF_BOUNDS = "Index out of bounds";
/**
 * Asserts that the expression passed to the function is truthy, otherwise throws a new Error with the provided message.
 *
 * @param expression - The expression to be asserted.
 * @param message - The error message to be printed.
 */
function assert(expression, message) {
  if (!expression) {
    throw new Error("assertion failed: " + message);
  }
}
function getValueWithOptions(value, options = {
  deserializer: deserialize
}) {
  if (value === null) {
    return options?.defaultValue ?? null;
  }
  const deserialized = deserialize(value);
  if (deserialized === undefined || deserialized === null) {
    return options?.defaultValue ?? null;
  }
  if (options?.reconstructor) {
    return options.reconstructor(deserialized);
  }
  return deserialized;
}
function serializeValueWithOptions(value, {
  serializer
} = {
  serializer: serialize
}) {
  return serializer(value);
}
function serialize(valueToSerialize) {
  return encode(JSON.stringify(valueToSerialize, function (key, value) {
    if (typeof value === "bigint") {
      return {
        value: value.toString(),
        [TYPE_KEY]: TypeBrand.BIGINT
      };
    }
    if (typeof this[key] === "object" && this[key] !== null && this[key] instanceof Date) {
      return {
        value: this[key].toISOString(),
        [TYPE_KEY]: TypeBrand.DATE
      };
    }
    return value;
  }));
}
function deserialize(valueToDeserialize) {
  return JSON.parse(decode(valueToDeserialize), (_, value) => {
    if (value !== null && typeof value === "object" && Object.keys(value).length === 2 && Object.keys(value).every(key => ["value", TYPE_KEY].includes(key))) {
      switch (value[TYPE_KEY]) {
        case TypeBrand.BIGINT:
          return BigInt(value["value"]);
        case TypeBrand.DATE:
          return new Date(value["value"]);
      }
    }
    return value;
  });
}
/**
 * Convert a string to Uint8Array, each character must have a char code between 0-255.
 * @param s - string that with only Latin1 character to convert
 * @returns result Uint8Array
 */
function bytes(s) {
  return env.latin1_string_to_uint8array(s);
}
/**
 * Convert a Uint8Array to string, each uint8 to the single character of that char code
 * @param a - Uint8Array to convert
 * @returns result string
 */
function str(a) {
  return env.uint8array_to_latin1_string(a);
}
/**
 * Encode the string to Uint8Array with UTF-8 encoding
 * @param s - String to encode
 * @returns result Uint8Array
 */
function encode(s) {
  return env.utf8_string_to_uint8array(s);
}
/**
 * Decode the Uint8Array to string in UTF-8 encoding
 * @param a - array to decode
 * @returns result string
 */
function decode(a) {
  return env.uint8array_to_utf8_string(a);
}

var CurveType;
(function (CurveType) {
  CurveType[CurveType["ED25519"] = 0] = "ED25519";
  CurveType[CurveType["SECP256K1"] = 1] = "SECP256K1";
})(CurveType || (CurveType = {}));
var DataLength;
(function (DataLength) {
  DataLength[DataLength["ED25519"] = 32] = "ED25519";
  DataLength[DataLength["SECP256K1"] = 64] = "SECP256K1";
})(DataLength || (DataLength = {}));

/**
 * A Promise result in near can be one of:
 * - NotReady = 0 - the promise you are specifying is still not ready, not yet failed nor successful.
 * - Successful = 1 - the promise has been successfully executed and you can retrieve the resulting value.
 * - Failed = 2 - the promise execution has failed.
 */
var PromiseResult;
(function (PromiseResult) {
  PromiseResult[PromiseResult["NotReady"] = 0] = "NotReady";
  PromiseResult[PromiseResult["Successful"] = 1] = "Successful";
  PromiseResult[PromiseResult["Failed"] = 2] = "Failed";
})(PromiseResult || (PromiseResult = {}));
/**
 * A promise error can either be due to the promise failing or not yet being ready.
 */
var PromiseError;
(function (PromiseError) {
  PromiseError[PromiseError["Failed"] = 0] = "Failed";
  PromiseError[PromiseError["NotReady"] = 1] = "NotReady";
})(PromiseError || (PromiseError = {}));

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;
/**
 * Logs parameters in the NEAR WASM virtual machine.
 *
 * @param params - Parameters to log.
 */
function log(...params) {
  env.log(params.reduce((accumulated, parameter, index) => {
    // Stringify undefined
    const param = parameter === undefined ? "undefined" : parameter;
    // Convert Objects to strings and convert to string
    const stringified = typeof param === "object" ? JSON.stringify(param) : `${param}`;
    if (index === 0) {
      return stringified;
    }
    return `${accumulated} ${stringified}`;
  }, ""));
}
/**
 * Returns the account ID of the account that called the function.
 * Can only be called in a call or initialize function.
 */
function predecessorAccountId() {
  env.predecessor_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the account ID of the current contract - the contract that is being executed.
 */
function currentAccountId() {
  env.current_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the amount of NEAR attached to this function call.
 * Can only be called in payable functions.
 */
function attachedDeposit() {
  return env.attached_deposit();
}
/**
 * Reads the value from NEAR storage that is stored under the provided key.
 *
 * @param key - The key to read from storage.
 */
function storageReadRaw(key) {
  const returnValue = env.storage_read(key, 0);
  if (returnValue !== 1n) {
    return null;
  }
  return env.read_register(0);
}
/**
 * Checks for the existance of a value under the provided key in NEAR storage.
 *
 * @param key - The key to check for in storage.
 */
function storageHasKeyRaw(key) {
  return env.storage_has_key(key) === 1n;
}
/**
 * Checks for the existance of a value under the provided utf-8 string key in NEAR storage.
 *
 * @param key - The utf-8 string key to check for in storage.
 */
function storageHasKey(key) {
  return storageHasKeyRaw(encode(key));
}
/**
 * Get the last written or removed value from NEAR storage.
 */
function storageGetEvictedRaw() {
  return env.read_register(EVICTED_REGISTER);
}
/**
 * Writes the provided bytes to NEAR storage under the provided key.
 *
 * @param key - The key under which to store the value.
 * @param value - The value to store.
 */
function storageWriteRaw(key, value) {
  return env.storage_write(key, value, EVICTED_REGISTER) === 1n;
}
/**
 * Removes the value of the provided key from NEAR storage.
 *
 * @param key - The key to be removed.
 */
function storageRemoveRaw(key) {
  return env.storage_remove(key, EVICTED_REGISTER) === 1n;
}
/**
 * Removes the value of the provided utf-8 string key from NEAR storage.
 *
 * @param key - The utf-8 string key to be removed.
 */
function storageRemove(key) {
  return storageRemoveRaw(encode(key));
}
/**
 * Returns the arguments passed to the current smart contract call.
 */
function inputRaw() {
  env.input(0);
  return env.read_register(0);
}
/**
 * Returns the arguments passed to the current smart contract call as utf-8 string.
 */
function input() {
  return decode(inputRaw());
}

/**
 * A lookup map that stores data in NEAR storage.
 */
class LookupMap {
  /**
   * @param keyPrefix - The byte prefix to use when storing elements inside this collection.
   */
  constructor(keyPrefix) {
    this.keyPrefix = keyPrefix;
  }
  /**
   * Checks whether the collection contains the value.
   *
   * @param key - The value for which to check the presence.
   */
  containsKey(key) {
    const storageKey = this.keyPrefix + key;
    return storageHasKey(storageKey);
  }
  /**
   * Get the data stored at the provided key.
   *
   * @param key - The key at which to look for the data.
   * @param options - Options for retrieving the data.
   */
  get(key, options) {
    const storageKey = this.keyPrefix + key;
    const value = storageReadRaw(encode(storageKey));
    return getValueWithOptions(value, options);
  }
  /**
   * Removes and retrieves the element with the provided key.
   *
   * @param key - The key at which to remove data.
   * @param options - Options for retrieving the data.
   */
  remove(key, options) {
    const storageKey = this.keyPrefix + key;
    if (!storageRemove(storageKey)) {
      return options?.defaultValue ?? null;
    }
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Store a new value at the provided key.
   *
   * @param key - The key at which to store in the collection.
   * @param newValue - The value to store in the collection.
   * @param options - Options for retrieving and storing the data.
   */
  set(key, newValue, options) {
    const storageKey = this.keyPrefix + key;
    const storageValue = serializeValueWithOptions(newValue, options);
    if (!storageWriteRaw(encode(storageKey), storageValue)) {
      return options?.defaultValue ?? null;
    }
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Extends the current collection with the passed in array of key-value pairs.
   *
   * @param keyValuePairs - The key-value pairs to extend the collection with.
   * @param options - Options for storing the data.
   */
  extend(keyValuePairs, options) {
    for (const [key, value] of keyValuePairs) {
      this.set(key, value, options);
    }
  }
  /**
   * Serialize the collection.
   *
   * @param options - Options for storing the data.
   */
  serialize(options) {
    return serializeValueWithOptions(this, options);
  }
  /**
   * Converts the deserialized data from storage to a JavaScript instance of the collection.
   *
   * @param data - The deserialized data to create an instance from.
   */
  static reconstruct(data) {
    return new LookupMap(data.keyPrefix);
  }
}

function indexToKey(prefix, index) {
  const data = new Uint32Array([index]);
  const array = new Uint8Array(data.buffer);
  const key = str(array);
  return prefix + key;
}
/**
 * An iterable implementation of vector that stores its content on the trie.
 * Uses the following map: index -> element
 */
class Vector {
  /**
   * @param prefix - The byte prefix to use when storing elements inside this collection.
   * @param length - The initial length of the collection. By default 0.
   */
  constructor(prefix, length = 0) {
    this.prefix = prefix;
    this.length = length;
  }
  /**
   * Checks whether the collection is empty.
   */
  isEmpty() {
    return this.length === 0;
  }
  /**
   * Get the data stored at the provided index.
   *
   * @param index - The index at which to look for the data.
   * @param options - Options for retrieving the data.
   */
  get(index, options) {
    if (index >= this.length) {
      return options?.defaultValue ?? null;
    }
    const storageKey = indexToKey(this.prefix, index);
    const value = storageReadRaw(bytes(storageKey));
    return getValueWithOptions(value, options);
  }
  /**
   * Removes an element from the vector and returns it in serialized form.
   * The removed element is replaced by the last element of the vector.
   * Does not preserve ordering, but is `O(1)`.
   *
   * @param index - The index at which to remove the element.
   * @param options - Options for retrieving and storing the data.
   */
  swapRemove(index, options) {
    assert(index < this.length, ERR_INDEX_OUT_OF_BOUNDS);
    if (index + 1 === this.length) {
      return this.pop(options);
    }
    const key = indexToKey(this.prefix, index);
    const last = this.pop(options);
    assert(storageWriteRaw(bytes(key), serializeValueWithOptions(last, options)), ERR_INCONSISTENT_STATE);
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Adds data to the collection.
   *
   * @param element - The data to store.
   * @param options - Options for storing the data.
   */
  push(element, options) {
    const key = indexToKey(this.prefix, this.length);
    this.length += 1;
    storageWriteRaw(bytes(key), serializeValueWithOptions(element, options));
  }
  /**
   * Removes and retrieves the element with the highest index.
   *
   * @param options - Options for retrieving the data.
   */
  pop(options) {
    if (this.isEmpty()) {
      return options?.defaultValue ?? null;
    }
    const lastIndex = this.length - 1;
    const lastKey = indexToKey(this.prefix, lastIndex);
    this.length -= 1;
    assert(storageRemoveRaw(bytes(lastKey)), ERR_INCONSISTENT_STATE);
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Replaces the data stored at the provided index with the provided data and returns the previously stored data.
   *
   * @param index - The index at which to replace the data.
   * @param element - The data to replace with.
   * @param options - Options for retrieving and storing the data.
   */
  replace(index, element, options) {
    assert(index < this.length, ERR_INDEX_OUT_OF_BOUNDS);
    const key = indexToKey(this.prefix, index);
    assert(storageWriteRaw(bytes(key), serializeValueWithOptions(element, options)), ERR_INCONSISTENT_STATE);
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Extends the current collection with the passed in array of elements.
   *
   * @param elements - The elements to extend the collection with.
   */
  extend(elements) {
    for (const element of elements) {
      this.push(element);
    }
  }
  [Symbol.iterator]() {
    return new VectorIterator(this);
  }
  /**
   * Create a iterator on top of the default collection iterator using custom options.
   *
   * @param options - Options for retrieving and storing the data.
   */
  createIteratorWithOptions(options) {
    return {
      [Symbol.iterator]: () => new VectorIterator(this, options)
    };
  }
  /**
   * Return a JavaScript array of the data stored within the collection.
   *
   * @param options - Options for retrieving and storing the data.
   */
  toArray(options) {
    const array = [];
    const iterator = options ? this.createIteratorWithOptions(options) : this;
    for (const value of iterator) {
      array.push(value);
    }
    return array;
  }
  /**
   * Remove all of the elements stored within the collection.
   */
  clear() {
    for (let index = 0; index < this.length; index++) {
      const key = indexToKey(this.prefix, index);
      storageRemoveRaw(bytes(key));
    }
    this.length = 0;
  }
  /**
   * Serialize the collection.
   *
   * @param options - Options for storing the data.
   */
  serialize(options) {
    return serializeValueWithOptions(this, options);
  }
  /**
   * Converts the deserialized data from storage to a JavaScript instance of the collection.
   *
   * @param data - The deserialized data to create an instance from.
   */
  static reconstruct(data) {
    const vector = new Vector(data.prefix, data.length);
    return vector;
  }
}
/**
 * An iterator for the Vector collection.
 */
class VectorIterator {
  /**
   * @param vector - The vector collection to create an iterator for.
   * @param options - Options for retrieving and storing data.
   */
  constructor(vector, options) {
    this.vector = vector;
    this.options = options;
    this.current = 0;
  }
  next() {
    if (this.current >= this.vector.length) {
      return {
        value: null,
        done: true
      };
    }
    const value = this.vector.get(this.current, this.options);
    this.current += 1;
    return {
      value,
      done: false
    };
  }
}

/**
 * An unordered map that stores data in NEAR storage.
 */
class UnorderedMap {
  /**
   * @param prefix - The byte prefix to use when storing elements inside this collection.
   */
  constructor(prefix) {
    this.prefix = prefix;
    this._keys = new Vector(`${prefix}u`); // intentional different prefix with old UnorderedMap
    this.values = new LookupMap(`${prefix}m`);
  }
  /**
   * The number of elements stored in the collection.
   */
  get length() {
    return this._keys.length;
  }
  /**
   * Checks whether the collection is empty.
   */
  isEmpty() {
    return this._keys.isEmpty();
  }
  /**
   * Get the data stored at the provided key.
   *
   * @param key - The key at which to look for the data.
   * @param options - Options for retrieving the data.
   */
  get(key, options) {
    const valueAndIndex = this.values.get(key);
    if (valueAndIndex === null) {
      return options?.defaultValue ?? null;
    }
    const [value] = valueAndIndex;
    return getValueWithOptions(encode(value), options);
  }
  /**
   * Store a new value at the provided key.
   *
   * @param key - The key at which to store in the collection.
   * @param value - The value to store in the collection.
   * @param options - Options for retrieving and storing the data.
   */
  set(key, value, options) {
    const valueAndIndex = this.values.get(key);
    const serialized = serializeValueWithOptions(value, options);
    if (valueAndIndex === null) {
      const newElementIndex = this.length;
      this._keys.push(key);
      this.values.set(key, [decode(serialized), newElementIndex]);
      return null;
    }
    const [oldValue, oldIndex] = valueAndIndex;
    this.values.set(key, [decode(serialized), oldIndex]);
    return getValueWithOptions(encode(oldValue), options);
  }
  /**
   * Removes and retrieves the element with the provided key.
   *
   * @param key - The key at which to remove data.
   * @param options - Options for retrieving the data.
   */
  remove(key, options) {
    const oldValueAndIndex = this.values.remove(key);
    if (oldValueAndIndex === null) {
      return options?.defaultValue ?? null;
    }
    const [value, index] = oldValueAndIndex;
    assert(this._keys.swapRemove(index) !== null, ERR_INCONSISTENT_STATE);
    // the last key is swapped to key[index], the corresponding [value, index] need update
    if (!this._keys.isEmpty() && index !== this._keys.length) {
      // if there is still elements and it was not the last element
      const swappedKey = this._keys.get(index);
      const swappedValueAndIndex = this.values.get(swappedKey);
      assert(swappedValueAndIndex !== null, ERR_INCONSISTENT_STATE);
      this.values.set(swappedKey, [swappedValueAndIndex[0], index]);
    }
    return getValueWithOptions(encode(value), options);
  }
  /**
   * Remove all of the elements stored within the collection.
   */
  clear() {
    for (const key of this._keys) {
      // Set instead of remove to avoid loading the value from storage.
      this.values.set(key, null);
    }
    this._keys.clear();
  }
  [Symbol.iterator]() {
    return new UnorderedMapIterator(this);
  }
  /**
   * Create a iterator on top of the default collection iterator using custom options.
   *
   * @param options - Options for retrieving and storing the data.
   */
  createIteratorWithOptions(options) {
    return {
      [Symbol.iterator]: () => new UnorderedMapIterator(this, options)
    };
  }
  /**
   * Return a JavaScript array of the data stored within the collection.
   *
   * @param options - Options for retrieving and storing the data.
   */
  toArray(options) {
    const array = [];
    const iterator = options ? this.createIteratorWithOptions(options) : this;
    for (const value of iterator) {
      array.push(value);
    }
    return array;
  }
  /**
   * Extends the current collection with the passed in array of key-value pairs.
   *
   * @param keyValuePairs - The key-value pairs to extend the collection with.
   */
  extend(keyValuePairs) {
    for (const [key, value] of keyValuePairs) {
      this.set(key, value);
    }
  }
  /**
   * Serialize the collection.
   *
   * @param options - Options for storing the data.
   */
  serialize(options) {
    return serializeValueWithOptions(this, options);
  }
  /**
   * Converts the deserialized data from storage to a JavaScript instance of the collection.
   *
   * @param data - The deserialized data to create an instance from.
   */
  static reconstruct(data) {
    const map = new UnorderedMap(data.prefix);
    // reconstruct keys Vector
    map._keys = new Vector(`${data.prefix}u`);
    map._keys.length = data._keys.length;
    // reconstruct values LookupMap
    map.values = new LookupMap(`${data.prefix}m`);
    return map;
  }
  keys({
    start,
    limit
  }) {
    const ret = [];
    if (start === undefined) {
      start = 0;
    }
    if (limit == undefined) {
      limit = this.length - start;
    }
    for (let i = start; i < start + limit; i++) {
      ret.push(this._keys.get(i));
    }
    return ret;
  }
}
/**
 * An iterator for the UnorderedMap collection.
 */
class UnorderedMapIterator {
  /**
   * @param unorderedMap - The unordered map collection to create an iterator for.
   * @param options - Options for retrieving and storing data.
   */
  constructor(unorderedMap, options) {
    this.options = options;
    this.keys = new VectorIterator(unorderedMap._keys);
    this.map = unorderedMap.values;
  }
  next() {
    const key = this.keys.next();
    if (key.done) {
      return {
        value: [key.value, null],
        done: key.done
      };
    }
    const valueAndIndex = this.map.get(key.value);
    assert(valueAndIndex !== null, ERR_INCONSISTENT_STATE);
    return {
      done: key.done,
      value: [key.value, getValueWithOptions(encode(valueAndIndex[0]), this.options)]
    };
  }
}

/**
 * Tells the SDK to use this function as the initialization function of the contract.
 *
 * @param _empty - An empty object.
 */
function initialize(_empty) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target, _key, _descriptor
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {};
}
/**
 * Tells the SDK to expose this function as a view function.
 *
 * @param _empty - An empty object.
 */
function view(_empty) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target, _key, _descriptor
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {};
}
function call({
  privateFunction = false,
  payableFunction = false
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target, _key, descriptor) {
    const originalMethod = descriptor.value;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    descriptor.value = function (...args) {
      if (privateFunction && predecessorAccountId() !== currentAccountId()) {
        throw new Error("Function is private");
      }
      if (!payableFunction && attachedDeposit() > 0n) {
        throw new Error("Function is not payable");
      }
      return originalMethod.apply(this, args);
    };
  };
}
function NearBindgen({
  requireInit = false,
  serializer = serialize,
  deserializer = deserialize
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return target => {
    return class extends target {
      static _create() {
        return new target();
      }
      static _getState() {
        const rawState = storageReadRaw(bytes("STATE"));
        return rawState ? this._deserialize(rawState) : null;
      }
      static _saveToStorage(objectToSave) {
        storageWriteRaw(bytes("STATE"), this._serialize(objectToSave));
      }
      static _getArgs() {
        return JSON.parse(input() || "{}");
      }
      static _serialize(value, forReturn = false) {
        if (forReturn) {
          return encode(JSON.stringify(value, (_, value) => typeof value === "bigint" ? `${value}` : value));
        }
        return serializer(value);
      }
      static _deserialize(value) {
        return deserializer(value);
      }
      static _reconstruct(classObject, plainObject) {
        for (const item in classObject) {
          const reconstructor = classObject[item].constructor?.reconstruct;
          classObject[item] = reconstructor ? reconstructor(plainObject[item]) : plainObject[item];
        }
        return classObject;
      }
      static _requireInit() {
        return requireInit;
      }
    };
  };
}

class Play {
  constructor({
    player,
    gameId
  }) {
    this.player = player;
    this.gameId = gameId;
  }
}
class Stat {
  constructor({
    player_id,
    game_id
  }) {
    this.player_id = player_id;
    this.score = 0;
    this.game_id = game_id;
    this.challengeData = [];
  }
}
class Game {
  constructor({
    admin,
    url,
    name,
    challenges,
    description,
    img_url,
    cost_to_play,
    leaderboardRewards,
    challengeRewards
  }) {
    this.url = url;
    this.name = name;
    this.challenges = challenges;
    this.admin = admin;
    this.description = description;
    this.img_url = img_url;
    this.cost_to_play = cost_to_play;
    this.leaderboardRewards = leaderboardRewards;
    this.challengeRewards = challengeRewards;
    this.shop = [];
  }
}
class GameChallengeMetadata {
  constructor(metadata) {
    this.name = metadata.name;
    this.description = metadata.description;
    this.value = 0;
    this.thresholds = metadata.thresholds;
  }
}
class Listing {
  constructor({
    id,
    seller,
    price,
    type,
    contract_id,
    img_src
  }) {
    this.id = id;
    this.seller = seller;
    this.price = price;
    this.type = type;
    this.contract_id = contract_id;
    this.img_src = img_src;
  }
}

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _class, _class2;
class PhysicalPrize {
  constructor({
    id,
    tracking_num,
    player_id,
    ticket_reward
  }) {
    this.id = id;
    this.tracking_num = tracking_num;
    this.player_id = player_id;
    this.ticket_reward = ticket_reward;
  }
}
let Arcade = (_dec = NearBindgen({}), _dec2 = initialize(), _dec3 = call({}), _dec4 = call({}), _dec5 = call({}), _dec6 = call({}), _dec7 = call({}), _dec8 = view(), _dec9 = view(), _dec10 = call({}), _dec11 = call({}), _dec12 = call({}), _dec13 = view(), _dec14 = call({}), _dec15 = call({}), _dec16 = call({}), _dec17 = call({}), _dec18 = view(), _dec19 = view(), _dec20 = view(), _dec21 = view(), _dec22 = view(), _dec23 = view(), _dec24 = view(), _dec25 = view(), _dec26 = view(), _dec27 = view(), _dec28 = view(), _dec29 = view(), _dec30 = view(), _dec31 = call({}), _dec32 = call({}), _dec(_class = (_class2 = class Arcade {
  constructor() {
    this.games = new UnorderedMap("games");
    this.plays = new LookupMap("plays");
    this.ticketBalances = new LookupMap("ticket_balances");
    this.listings = new UnorderedMap("listings");
    this.playerStats = new UnorderedMap("player_stats");
    this.ticketLeaderboard = new UnorderedMap("ticket_leaderboard");
    this.physicalPrizes = new UnorderedMap("physical_prizes");
  }
  init() {
    this.ticketBalances.set("ARCADE", 1000000000000000);
  }
  takeDownListing({
    id
  }) {
    assert(this.listings.get(id), "Listing does not exist");
    this.listings.remove(id);
  }
  claimPhysicalPrizeTicketReward({
    id
  }) {
    const prize = this.physicalPrizes.get(id);
    assert(prize, "Prize does not exist");
    assert(prize.player_id === predecessorAccountId(), "You do not own this prize");
    // check to see if prize has been delivered
    // if so, then give player the ticket reward
    this.ticketBalances.set(predecessorAccountId(), (this.ticketBalances.get(predecessorAccountId()) || 0) + prize.ticket_reward);
  }
  updatePhysicalPrizeTrackingInfo({
    tracking_num,
    id
  }) {
    const prize = this.physicalPrizes.get(id);
    assert(prize, "Prize does not exist");
    assert(prize.player_id === predecessorAccountId(), "You do not own this prize");
    prize.tracking_num = tracking_num;
    this.physicalPrizes.set(id, prize);
  }
  createListing({
    id,
    price,
    type,
    contract_id,
    img_src
  }) {
    assert(!this.listings.get(id), "Listing already exists");
    const listing = new Listing({
      id,
      seller: predecessorAccountId(),
      price,
      type,
      contract_id,
      img_src
    });
    this.listings.set(id, listing);
    // const promise = near.promiseBatchCreate(contract_id);
    // if (type === "nft") {
    //     near.promiseBatchActionFunctionCall(
    //         promise,
    //         "nft_transfer",
    //         JSON.stringify({
    //             receiver_id: contract_id,
    //             token_id: id,
    //             approval_id: null,
    //             memo: null
    //         }),
    //         1,
    //         GAS_FOR_NFT_TRANSFER
    //     )
    // } else if (type === "coin") {
    //     near.promiseBatchActionFunctionCall(
    //         promise,
    //         "ft_transfer",
    //         JSON.stringify({
    //             receiver_id: "xeony.testnet",
    //             amount: price,
    //             memo: null
    //         }),
    //         1,
    //         GAS_FOR_NFT_TRANSFER
    //     )
    // }
  }

  buyListing({
    id
  }) {
    const listing = this.listings.get(id);
    assert(listing, "Listing does not exist");
    const buyerTickets = this.ticketBalances.get(predecessorAccountId()) || 0;
    if (buyerTickets >= BigInt(listing.price)) {
      if (listing.type === "physical") {
        const physicalPrize = new PhysicalPrize({
          id,
          tracking_num: "",
          player_id: listing.seller,
          ticket_reward: listing.price
        });
        this.physicalPrizes.set(id, physicalPrize);
      } else {
        this.ticketBalances.set(listing.seller, this.ticketBalances.get(listing.seller) || 0 + listing.price);
      }
      this.ticketBalances.set(predecessorAccountId(), buyerTickets - listing.price);
      this.listings.remove(id);
    }
  }
  getListings() {
    return this.listings.toArray().map(data => data[1]);
  }
  getMyListings({
    account_id
  }) {
    return this.listings.toArray().filter(data => data[1].seller === account_id).map(data => data[1]);
  }
  buyFromGameShop({
    game_id,
    name
  }) {
    const game = this.games.get(game_id);
    assert(game, "Game does not exist");
    const listing = game.shop.find(listing => listing.name === name);
    assert(listing, "Listing does not exist");
    const buyerTickets = this.ticketBalances.get(predecessorAccountId()) || 0;
    assert(buyerTickets >= listing.price, "Not enough tickets to buy this item");
    this.ticketBalances.set(predecessorAccountId(), buyerTickets - listing.price);
    this.ticketBalances.set(game.admin, (this.ticketBalances.get(game.admin) || 0) + listing.price);

    // todo: send item to player
  }

  addToGameShop({
    game_id,
    name,
    description,
    price,
    type,
    img_src
  }) {
    const game = this.games.get(game_id);
    assert(game, "Game does not exist");
    assert(game.admin === predecessorAccountId(), "You are not the admin of this game");
    // todo: take iten fron uploader
    const listing = {
      name,
      description,
      price,
      type,
      img_src
    };
    game.shop.push(listing);
    this.games.set(game_id, game);
  }
  removeFromGameShop({
    game_id,
    name
  }) {
    const game = this.games.get(game_id);
    assert(game, "Game does not exist");
    assert(game.admin === predecessorAccountId(), "You are not the admin of this game");
    game.shop = game.shop.filter(listing => listing.name !== name);
    this.games.set(game_id, game);
  }
  getGameShop({
    game_id
  }) {
    const game = this.games.get(game_id);
    assert(game, "Game does not exist");
    return game.shop;
  }
  createGame({
    url,
    name,
    description,
    challenges,
    cost_to_play,
    img_url,
    leaderboardRewards,
    challengeRewards
  }) {
    // get user to pay for storage
    assert(!this.games.toArray().map(data => data[0]).includes(name), "Game already exists");
    // NearPromise.new("xeony.testnet").transfer(BigInt(1) * ONE_NEAR)
    let challengeMap = challenges.map(challenge => new GameChallengeMetadata(challenge));
    const game = new Game({
      admin: predecessorAccountId(),
      url,
      name,
      description,
      challenges: challengeMap,
      img_url,
      cost_to_play,
      leaderboardRewards,
      challengeRewards
    });
    this.games.set(name, game);
  }
  fundGame({
    name,
    amount
  }) {
    // transfer some near out of the callers account to the contract
    // NearPromise.new("xeony.testnet").transfer(BigInt(amount) * ONE_NEAR)
    const game = this.games.get(name);
    assert(game, "Game does not exist");
    const currentGameBalance = this.ticketBalances.get(name) || 0;
    this.ticketBalances.set(name, currentGameBalance + amount * 1000);
    this.ticketBalances.set("ARCADE", this.ticketBalances.get("ARCADE") - amount * 1000);
  }
  playGame({
    gameId
  }) {
    const playerId = predecessorAccountId();
    const game = this.games.get(gameId);
    assert(game, "Game does not exist");
    // game.cost_to_play near withdrawn from player account and sent to game admin
    const play = new Play({
      player: playerId,
      gameId
    });
    // need to get player account
    // need to assert player called the playgame function
    this.plays.set(`${gameId}-${playerId}`, play);
  }
  endGame({
    gameId,
    challenge_data,
    new_score,
    ticket_reward
  }) {
    const playerId = predecessorAccountId();
    const playKey = `${gameId}-${playerId}`;
    assert(this.plays.containsKey(playKey), "Player has not played this game");
    assert(this.games.get(gameId), "Game does not exist");
    // need to assert that the game creator is the account that called this function
    // then update player progress on challenges
    const stats = this.playerStats.get(playerId)?.find(stat => stat.game_id === gameId);
    if (stats) {
      log(stats);
      for (const data of challenge_data) {
        const challenge = stats.challengeData.find(value => value.name === data.name);
        if (challenge !== undefined) {
          challenge.value += data.value;
        } else {
          stats.challengeData.push(data);
        }
      }
      stats.score += new_score;
      this.playerStats.set(playerId, this.playerStats.get(playerId).map(stat => stat.game_id === gameId ? stats : stat));
      log(stats);
    } else {
      const newStat = new Stat({
        player_id: playerId,
        game_id: gameId
      });
      newStat.score = new_score;
      newStat.challengeData = challenge_data;
      const currentStats = this.playerStats.get(playerId) || [];
      currentStats.push(newStat);
      this.playerStats.set(playerId, currentStats);
    }
    // now update tickets
    const currentGameTickets = this.ticketBalances.get(gameId) || 0;
    if (currentGameTickets > ticket_reward) {
      this.ticketBalances.set(gameId, currentGameTickets - ticket_reward);
      this.ticketBalances.set(playerId, (this.ticketBalances.get(playerId) || 0) + ticket_reward);
      this.ticketLeaderboard.set(playerId, (this.ticketLeaderboard.get(playerId) || 0) + ticket_reward);
    } else {
      log("Not enough tickets in game account");
    }
  }
  getMyTickets({
    player_id
  }) {
    return this.ticketBalances.get(player_id) || 0;
  }
  getGames() {
    return this.games.toArray().map(data => data[1]);
  }
  getMyGames({
    account_id
  }) {
    return this.games.toArray().filter(data => data[1].admin === account_id).map(data => data[1]);
  }
  getChallengesForGame({
    gameName
  }) {
    return this.games.get(gameName)?.challenges || [];
  }
  getGame({
    name
  }) {
    return this.games.get(name);
  }
  getStat({
    game_id,
    player_id
  }) {
    return this.playerStats.get(player_id)?.find(stat => stat.game_id === game_id);
  }
  getStatsForPlayer({
    player_id
  }) {
    return this.playerStats.get(player_id) || [];
  }
  getGameLeaderboard({
    game_id
  }) {
    return this.playerStats.toArray().map(data => data[1]).reduce((prev, curr) => {
      prev.push(...curr);
      return prev;
    }, []).filter(stat => stat.game_id === game_id).sort((a, b) => b.score - a.score);
  }
  getGamesPlayed({
    player_id
  }) {
    return this.playerStats.get(player_id) || [];
  }
  getPlaying({
    gameId,
    playerId
  }) {
    return this.plays.get(`${gameId}-${playerId}`) ? true : false;
  }
  getPlays() {
    return this.plays;
  }
  getTicketLeaderboard() {
    return this.ticketLeaderboard.toArray().map(data => data[1]).sort((a, b) => b - a).splice(0, 10);
  }
  getMyPhysicalPrizes({
    player_id
  }) {
    return this.physicalPrizes.toArray().map(data => data[1]).filter(prize => prize.player_id === player_id);
  }
  claimLeaderboardReward({
    player_id,
    game_id
  }) {
    const game = this.games.get(game_id);
    assert(game, "Game does not exist");
    const leaderboard = this.getGameLeaderboard({
      game_id
    });
    let playerIndex = -1;
    for (let i = 0; i < leaderboard.length; i++) {
      if (leaderboard[i].player_id === player_id) {
        playerIndex = i;
        break;
      }
    }
    if (playerIndex !== -1 && playerIndex < game.leaderboardRewards.length) {
      const currentGameTickets = this.ticketBalances.get(game.name) || 0;
      const ticket_reward = game.leaderboardRewards[playerIndex];
      if (currentGameTickets > ticket_reward) {
        this.ticketBalances.set(game.name, currentGameTickets - ticket_reward);
        this.ticketBalances.set(player_id, (this.ticketBalances.get(player_id) || 0) + ticket_reward);
        this.ticketLeaderboard.set(player_id, (this.ticketLeaderboard.get(player_id) || 0) + ticket_reward);
      }
    }
  }
  claimChallengeReward({
    player_id,
    game_id
  }) {
    const game = this.games.get(game_id);
    assert(game, "Game does not exist");
    const stat = this.getStat({
      player_id,
      game_id
    });
    assert(stat, "Stat does not exist");
    const gameStat = this.getStat({
      player_id,
      game_id
    });
    assert(gameStat, "Game stat does not exist");
    let totalTickets = 0;
    for (const challenge of gameStat.challengeData) {
      const metadata = game.challenges.find(data => data.name === challenge.name);
      if (metadata) {
        let i = 0;
        while (i < metadata.thresholds.length && challenge.value > metadata.thresholds[i]) {
          i++;
        }
        const tickets = i < game.challengeRewards.length ? game.challengeRewards[i] : game.challengeRewards[game.challengeRewards.length - 1];
        totalTickets += tickets;
      }
    }
    const currentGameTickets = this.ticketBalances.get(game.name) || 0;
    if (currentGameTickets > totalTickets && totalTickets > 0) {
      this.ticketBalances.set(game.name, currentGameTickets - totalTickets);
      this.ticketBalances.set(player_id, (this.ticketBalances.get(player_id) || 0) + totalTickets);
      this.ticketLeaderboard.set(player_id, (this.ticketLeaderboard.get(player_id) || 0) + totalTickets);
    }
  }
}, (_applyDecoratedDescriptor(_class2.prototype, "init", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "init"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "takeDownListing", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "takeDownListing"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "claimPhysicalPrizeTicketReward", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "claimPhysicalPrizeTicketReward"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "updatePhysicalPrizeTrackingInfo", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "updatePhysicalPrizeTrackingInfo"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "createListing", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "createListing"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "buyListing", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "buyListing"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getListings", [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "getListings"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getMyListings", [_dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "getMyListings"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "buyFromGameShop", [_dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "buyFromGameShop"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "addToGameShop", [_dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "addToGameShop"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "removeFromGameShop", [_dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "removeFromGameShop"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getGameShop", [_dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "getGameShop"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "createGame", [_dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "createGame"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "fundGame", [_dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "fundGame"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "playGame", [_dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "playGame"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "endGame", [_dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "endGame"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getMyTickets", [_dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "getMyTickets"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getGames", [_dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "getGames"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getMyGames", [_dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "getMyGames"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getChallengesForGame", [_dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "getChallengesForGame"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getGame", [_dec22], Object.getOwnPropertyDescriptor(_class2.prototype, "getGame"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getStat", [_dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "getStat"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getStatsForPlayer", [_dec24], Object.getOwnPropertyDescriptor(_class2.prototype, "getStatsForPlayer"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getGameLeaderboard", [_dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "getGameLeaderboard"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getGamesPlayed", [_dec26], Object.getOwnPropertyDescriptor(_class2.prototype, "getGamesPlayed"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getPlaying", [_dec27], Object.getOwnPropertyDescriptor(_class2.prototype, "getPlaying"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getPlays", [_dec28], Object.getOwnPropertyDescriptor(_class2.prototype, "getPlays"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getTicketLeaderboard", [_dec29], Object.getOwnPropertyDescriptor(_class2.prototype, "getTicketLeaderboard"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getMyPhysicalPrizes", [_dec30], Object.getOwnPropertyDescriptor(_class2.prototype, "getMyPhysicalPrizes"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "claimLeaderboardReward", [_dec31], Object.getOwnPropertyDescriptor(_class2.prototype, "claimLeaderboardReward"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "claimChallengeReward", [_dec32], Object.getOwnPropertyDescriptor(_class2.prototype, "claimChallengeReward"), _class2.prototype)), _class2)) || _class);
function claimChallengeReward() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.claimChallengeReward(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function claimLeaderboardReward() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.claimLeaderboardReward(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getMyPhysicalPrizes() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getMyPhysicalPrizes(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getTicketLeaderboard() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getTicketLeaderboard(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getPlays() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getPlays(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getPlaying() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getPlaying(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getGamesPlayed() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getGamesPlayed(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getGameLeaderboard() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getGameLeaderboard(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getStatsForPlayer() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getStatsForPlayer(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getStat() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getStat(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getGame() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getGame(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getChallengesForGame() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getChallengesForGame(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getMyGames() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getMyGames(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getGames() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getGames(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getMyTickets() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getMyTickets(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function endGame() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.endGame(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function playGame() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.playGame(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function fundGame() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.fundGame(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function createGame() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.createGame(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getGameShop() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getGameShop(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function removeFromGameShop() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.removeFromGameShop(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function addToGameShop() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.addToGameShop(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function buyFromGameShop() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.buyFromGameShop(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getMyListings() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getMyListings(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function getListings() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.getListings(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function buyListing() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.buyListing(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function createListing() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.createListing(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function updatePhysicalPrizeTrackingInfo() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.updatePhysicalPrizeTrackingInfo(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function claimPhysicalPrizeTicketReward() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.claimPhysicalPrizeTicketReward(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function takeDownListing() {
  const _state = Arcade._getState();
  if (!_state && Arcade._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = Arcade._create();
  if (_state) {
    Arcade._reconstruct(_contract, _state);
  }
  const _args = Arcade._getArgs();
  const _result = _contract.takeDownListing(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}
function init() {
  const _state = Arcade._getState();
  if (_state) {
    throw new Error("Contract already initialized");
  }
  const _contract = Arcade._create();
  const _args = Arcade._getArgs();
  const _result = _contract.init(_args);
  Arcade._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(Arcade._serialize(_result, true));
}

export { addToGameShop, buyFromGameShop, buyListing, claimChallengeReward, claimLeaderboardReward, claimPhysicalPrizeTicketReward, createGame, createListing, endGame, fundGame, getChallengesForGame, getGame, getGameLeaderboard, getGameShop, getGames, getGamesPlayed, getListings, getMyGames, getMyListings, getMyPhysicalPrizes, getMyTickets, getPlaying, getPlays, getStat, getStatsForPlayer, getTicketLeaderboard, init, playGame, removeFromGameShop, takeDownListing, updatePhysicalPrizeTrackingInfo };
//# sourceMappingURL=arcade.js.map
