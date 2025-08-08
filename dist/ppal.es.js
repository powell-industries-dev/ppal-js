import c from "moment";
import r from "lodash";
const n = [];
for (let t = 0; t < 256; ++t)
  n.push((t + 256).toString(16).slice(1));
function p(t, e = 0) {
  return (n[t[e + 0]] + n[t[e + 1]] + n[t[e + 2]] + n[t[e + 3]] + "-" + n[t[e + 4]] + n[t[e + 5]] + "-" + n[t[e + 6]] + n[t[e + 7]] + "-" + n[t[e + 8]] + n[t[e + 9]] + "-" + n[t[e + 10]] + n[t[e + 11]] + n[t[e + 12]] + n[t[e + 13]] + n[t[e + 14]] + n[t[e + 15]]).toLowerCase();
}
let d;
const S = new Uint8Array(16);
function g() {
  if (!d) {
    if (typeof crypto > "u" || !crypto.getRandomValues)
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    d = crypto.getRandomValues.bind(crypto);
  }
  return d(S);
}
const h = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), m = { randomUUID: h };
function y(t, e, o) {
  if (m.randomUUID && !t)
    return m.randomUUID();
  t = t || {};
  const i = t.random ?? t.rng?.() ?? g();
  if (i.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return i[6] = i[6] & 15 | 64, i[8] = i[8] & 63 | 128, p(i);
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
}, b = {
  /**
   * Returns the default date
   * @returns { string } The current date and time formatted as an ISO string.
   */
  date: () => c(/* @__PURE__ */ new Date()).toISOString()
}, w = {
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
}, f = {
  /**
   * Compares two objects and returns an object containing only the differences
   * @param { Object } inputs
   * @param { Object } inputs.original Required: The value of this object are considered the default in this comparison.
   * @param { Object } inputs.updated Required: The value of this object will be returned as output if they're different from inputs.original.
   * @param { string } inputs.prefix Optional: Default is an empty string.
   * @returns { Object } An object containing only the differences between inputs.original and inputs.updated.
   */
  diff: ({ original: t, updated: e, prefix: o = "" }) => !r.isObject(t) || !r.isObject(e) ? r.isEqual(t, e) ? {} : { [o.slice(0, -1)]: e } : r.isArray(t) && r.isArray(e) ? r.isEqual(t, e) ? {} : { [o.slice(0, -1)]: e } : r.transform(
    e,
    (i, s, u) => {
      const a = o + u;
      if (!r.has(t, u))
        i[a] = s;
      else if (!r.isEqual(s, t[u]))
        if (r.isObject(s) && r.isObject(t[u])) {
          const l = (void 0).diff({
            original: t[u],
            value: s,
            prefix: `${a}`
          });
          r.assign(i, l);
        } else
          i[a] = s;
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
  hasProperties: ({ object: t, properties: e }) => r.some(e, (o) => !r.isUndefined(r.get(t, o)))
}, D = {
  /**
   * Checks if a string is unique within an array of strings
   * @param { Object } inputs
   * @param { string } inputs.string Required: The string to check for
   * @param { string[] } inputs.array Required: The array to check against
   * @returns { boolean } Returns true if the string isn't found in the array (meaning it would be unique if added to that array), returns false otherwise.
   */
  uniqueInArray: ({ string: t, array: e }) => !new Set(e).has(t)
}, I = {
  /**
   * Format a date in several standard formats
   * @param { Object } inputs
   * @param { string } inputs.date Required: The date to format
   * @param { "DayOnly" | "Timestamp" } inputs.type Required: The format type
   * @param { string } inputs.timezone Optional: The timezone to use for the DayOnly format
   * @returns { string } The formatted date as an ISO string.
   */
  format: ({ date: t, type: e, timezone: o = "America/Denver" }) => {
    switch (e) {
      case "DayOnly":
        let i = c(t).format("YYYY-MM-DD");
        return c.tz(i, o).set({ hour: 6, minute: 0 }).toISOString();
      case "Timestamp":
        return c(t).toISOString();
      default:
        throw new Error(
          `${e}: This type isn't supported, please check your spelling.`
        );
    }
  },
  // ALIASES
  default: b.date,
  // Default for dates
  wrap: x.date
  // Date BSON wrapper
}, U = {
  /**
   * Checks if the value of an input is different from its default value
   * @param { Object } inputs
   * @param { ?string } inputs.value Required: The current value of the input
   * @param { ?string } inputs.initialData Required: The default value of the input
   * @param { Object & { primary: string } } inputs.theme Required: The current theme being used
   * @returns { ?string } If there's a difference, returns the HEX value to highlight the component. Otherwise, returns null.
   */
  inputDiff: ({ value: t, initialData: e, theme: o }) => t !== e ? `${o.primary}40` : null
}, j = {
  id: w,
  object: f,
  string: D,
  date: I,
  behavior: U
};
export {
  j as default
};
