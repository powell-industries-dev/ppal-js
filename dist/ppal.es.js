import u from "moment";
import r from "lodash";
const n = [];
for (let t = 0; t < 256; ++t)
  n.push((t + 256).toString(16).slice(1));
function g(t, e = 0) {
  return (n[t[e + 0]] + n[t[e + 1]] + n[t[e + 2]] + n[t[e + 3]] + "-" + n[t[e + 4]] + n[t[e + 5]] + "-" + n[t[e + 6]] + n[t[e + 7]] + "-" + n[t[e + 8]] + n[t[e + 9]] + "-" + n[t[e + 10]] + n[t[e + 11]] + n[t[e + 12]] + n[t[e + 13]] + n[t[e + 14]] + n[t[e + 15]]).toLowerCase();
}
let a;
const p = new Uint8Array(16);
function l() {
  if (!a) {
    if (typeof crypto > "u" || !crypto.getRandomValues)
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    a = crypto.getRandomValues.bind(crypto);
  }
  return a(p);
}
const h = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), m = { randomUUID: h };
function y(t, e, s) {
  if (m.randomUUID && !t)
    return m.randomUUID();
  t = t || {};
  const o = t.random ?? t.rng?.() ?? l();
  if (o.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return o[6] = o[6] & 15 | 64, o[8] = o[8] & 63 | 128, g(o);
}
const x = {
  /**
   * Wrap an id in valid BSON syntax for objectIds in MongoDB
   * @param { string } value Required: The objectId to wrap in BSON
   * @returns { { $oid: string } } A BSON-wrapped ObjectId.
   */
  id: (t) => ({ $oid: t }),
  /**
   * Wrap a date in valid BSON syntax for MongoDB
   * @param { string } value Required: The date string to wrap in BSON
   * @returns { { $date: string } } A BSON-wrapped date.
   */
  date: (t) => ({ $date: t })
}, w = {
  /**
   * Returns the default date
   * @returns { string } The current date and time formatted as an ISO string.
   */
  date: () => u(/* @__PURE__ */ new Date()).toISOString()
}, b = {
  /**
   * Generates a unique MongoDB-compatible ObjectId
   * @returns {string} A new MongoDB ObjectId string.
   */
  generateObjectId: () => {
    const t = ((/* @__PURE__ */ new Date()).getTime() / 1e3 | 0).toString(16), e = "xxxxxxxxxxxxxxxx".replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16)).toLowerCase();
    return `${t}${e}`;
  },
  /**
   * Generates a random uuid using uuid.v4()
   * @returns {string} A new v4 uuid string.
   */
  generateUuid: () => y(),
  // ALIASES
  wrap: x.id
  // ObjectId BSON wrapper
}, I = {
  /**
   * Compares two objects and returns an object containing only the differences
   * @param { Object } inputs
   * @param { Object } inputs.original Required: The value of this object are considered the default in this comparison.
   * @param { Object } inputs.updated Required: The value of this object will be returned as output if they're different from inputs.original.
   * @param { string } inputs.prefix Optional: Default is an empty string.
   * @returns { Object } An object containing only the differences between inputs.original and inputs.updated.
   */
  diff: ({ original: t, updated: e, prefix: s = "" }) => !r.isObject(t) || !r.isObject(e) ? r.isEqual(t, e) ? {} : { [s.slice(0, -1)]: e } : r.isArray(t) && r.isArray(e) ? r.isEqual(t, e) ? {} : { [s.slice(0, -1)]: e } : r.transform(
    e,
    (o, i, c) => {
      const d = s + c;
      if (!r.has(t, c))
        o[d] = i;
      else if (!r.isEqual(i, t[c]))
        if (r.isObject(i) && r.isObject(t[c])) {
          const S = (void 0).diff({
            original: t[c],
            value: i,
            prefix: `${d}`
          });
          r.assign(o, S);
        } else
          o[d] = i;
    },
    {}
  ),
  /**
   * Check if an object has one or more properties
   * @param { Object } inputs
   * @param { Object } inputs.object Required: The object to check
   * @param { string[] } inputs.properties Required: An array of properties to check for
   * @returns { boolean } Returns true if at least one property if found, returns false otherwise.
   */
  hasProperties: ({ object: t, properties: e }) => r.some(e, (s) => !r.isUndefined(r.get(t, s)))
}, D = {
  /**
   * Checks if a string is unique within an array of strings
   * @param { Object } inputs
   * @param { string } inputs.string Required: The string to check for
   * @param { string[] } inputs.array Required: The array to check against
   * @returns { boolean } Returns true if the string isn't found in the array (meaning it would be unique if added to that array), returns false otherwise.
   */
  uniqueInArray: ({ string: t, array: e }) => !new Set(e).has(t)
}, U = {
  /**
   * Format a date in several standard formats
   * @param { Object } inputs
   * @param { string } inputs.date Required: The date to format
   * @param { "DayOnly" | "Timestamp" } inputs.type Required: The format type
   * @param { string } inputs.timezone Optional: The timezone to use for the DayOnly format
   * @returns { string } The formatted date as an ISO string.
   */
  format: ({ date: t, type: e, timezone: s = "America/Denver" }) => {
    switch (e) {
      case "DayOnly":
        let o = u(t).format("YYYY-MM-DD");
        return u.tz(o, s).set({ hour: 6, minute: 0 }).toISOString();
      case "Timestamp":
        return u(t).toISOString();
      default:
        throw new Error(
          `${e}: This type isn't supported, please check your spelling.`
        );
    }
  },
  // ALIASES
  default: w.date,
  // Default for dates
  wrap: x.date
  // Date BSON wrapper
}, T = {
  id: b,
  object: I,
  string: D,
  date: U
};
export {
  T as default
};
