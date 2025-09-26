// --- DEPENDENCIES ---
import moment from "moment";
import { v4 as uuid } from "uuid";
import _ from "lodash";

// --- MONGODB BSON WRAPPERS ---
const wrappers = {
  /**
   * Wrap an id in valid BSON syntax for objectIds in MongoDB
   * @param { string } value Required: The objectId to wrap in BSON
   * @returns { { $oid: string } } A BSON-wrapped ObjectId.
   */
  id: (value) => {
    return { $oid: value };
  },
  /**
   * Wrap a date in valid BSON syntax for MongoDB
   * @param { string } value Required: The date string to wrap in BSON
   * @returns { { $date: string } } A BSON-wrapped date.
   */
  date: (value) => {
    return { $date: value };
  },
};

// --- DEFAULTS ---
const defaults = {
  /**
   * Returns the default date
   * @returns { string } The current date and time formatted as an ISO string.
   */
  date: () => {
    return moment(new Date()).toISOString();
  },
};

// --- WORKING WITH IDs ---
const id = {
  /**
   * Generates a unique MongoDB-compatible ObjectId
   * @returns {string} A new MongoDB ObjectId string.
   */
  generateObjectId: () => {
    /** @type {string} */
    const TIMESTAMP = ((new Date().getTime() / 1000) | 0).toString(16);
    /** @type {string} */
    const RANDOM_STRING = "xxxxxxxxxxxxxxxx"
      .replace(/x/g, () => {
        return ((Math.random() * 16) | 0).toString(16);
      })
      .toLowerCase();

    return `${TIMESTAMP}${RANDOM_STRING}`;
  },

  /**
   * Generates a random uuid using uuid.v4()
   * @returns {string} A new v4 uuid string.
   */
  generateUuid: () => {
    return uuid();
  },

  // ALIASES
  wrap: wrappers.id, // ObjectId BSON wrapper
};

// --- WORKING WITH OBJECTS ---
const object = {
  /**
   * Compares two objects and returns an object containing only the differences
   * @param { Object } inputs
   * @param { Object } inputs.original Required: The value of this object are considered the default in this comparison.
   * @param { Object } inputs.updated Required: The value of this object will be returned as output if they're different from inputs.original.
   * @param { string } inputs.prefix Optional: Default is an empty string.
   * @returns { Object } An object containing only the differences between `inputs.original` and `inputs.updated`.
   */
  diff: ({ original, updated, prefix = "" }) => {
    // EXCEPTION 1: At least one of the inputs is not an object | USED IN RECURSION
    if (!_.isObject(original) || !_.isObject(updated)) {
      return _.isEqual(original, updated)
        ? {}
        : { [prefix.slice(0, -1)]: updated };
    }

    // EXCEPTION 2: When comparing arrays, return the entire array if different | USED IN RECURSION
    if (_.isArray(original) && _.isArray(updated)) {
      return _.isEqual(original, updated)
        ? {}
        : { [prefix.slice(0, -1)]: updated };
    }

    return _.transform(
      updated,
      (result, value, key) => {
        /** @type { string } The current path, using dot notation (if needed) */
        const currentPath = prefix + key;

        if (!_.has(original, key)) {
          // CASE 1: Key doesn't exist in inputs.original
          result[currentPath] = value;
        } else if (!_.isEqual(value, original[key])) {
          // CASE 2: Value is different between inputs.original and inputs.updated

          // EXCEPTION 2.1: Value is a nested object
          if (_.isObject(value) && _.isObject(original[key])) {
            /** @type { Object } Recursive differences between value and original[key] */
            const nestedDiffs = this.diff({
              original: original[key],
              updated: value,
              prefix: `${currentPath}`,
            });
            _.assign(result, nestedDiffs);
          } else {
            result[currentPath] = value;
          }
        }
      },
      {},
    );
  },

  /**
   * Check if an object has one or more properties
   * @param { Object } inputs
   * @param { Object } inputs.object Required: The object to check
   * @param { string[] } inputs.properties Required: An array of properties to check for
   * @returns { boolean } Returns true if at least one property if found, returns false otherwise.
   */
  hasProperties: ({ object, properties }) => {
    return _.some(properties, (property) => {
      return !_.isUndefined(_.get(object, property));
    });
  },
};

const string = {
  /**
   * Checks if a string is unique within an array of strings
   * @param { Object } inputs
   * @param { string } inputs.string Required: The string to check for
   * @param { string[] } inputs.array Required: The array to check against
   * @returns { boolean } Returns true if the string isn't found in the array (meaning it would be unique if added to that array), returns false otherwise.
   */
  uniqueInArray: ({ string, array }) => {
    /** @type {Set} */
    const STRINGS_SET = new Set(array);

    return !STRINGS_SET.has(string);
  },
};

const date = {
  /**
   * Format a date in several standard formats
   * @param { Object } inputs
   * @param { string } inputs.date Required: The date to format
   * @param { "DayOnly" | "Timestamp" } inputs.type Required: The format type
   * @param { string } inputs.timezone Optional: The timezone to use for the DayOnly format
   * @returns { string } The formatted date as an ISO string.
   */
  format: ({ date, type, timezone = "America/Denver" }) => {
    switch (type) {
      case "DayOnly":
        /** @type { string } */
        let dateString = moment(date).format("YYYY-MM-DD");
        /** @type { moment } */
        let dateObject = moment
          .tz(dateString, timezone)
          .set({ hour: 6, minute: 0 });

        return dateObject.toISOString();
        break;
      case "Timestamp":
        return moment(date).toISOString();
        break;
      default:
        throw new Error(
          `${type}: This type isn't supported, please check your spelling.`,
        );
    }
  },

  // ALIASES
  default: defaults.date, // Default for dates
  wrap: wrappers.date, // Date BSON wrapper
};

// ---- DEFAULT BEHAVIORS ----
const behavior = {
  /**
   * Checks if the value of an input is different from its default value
   * @param { Object } inputs
   * @param { ?string } inputs.value Required: The current value of the input
   * @param { ?string } inputs.initialData Required: The default value of the input
   * @param { Object & { primary: string } } inputs.theme Required: The current theme being used
   * @returns { ?string } If there's a difference, returns the HEX value to highlight the component. Otherwise, returns null.
   */
  inputDiff: ({ value, initialData, theme }) => {
    if (value !== initialData) {
      return `${theme.primary}40`;
    } else {
      return null;
    }
  },
};

// TODO: calculate/custom (calculateSummary())

// --- EXPORT MODULE ---
export default {
  id,
  object,
  string,
  date,
  behavior,
};
