import u from "moment";
import e from "lodash";
const o = [];
for (let t = 0; t < 256; ++t)
  o.push((t + 256).toString(16).slice(1));
function x(t, n = 0) {
  return (o[t[n + 0]] + o[t[n + 1]] + o[t[n + 2]] + o[t[n + 3]] + "-" + o[t[n + 4]] + o[t[n + 5]] + "-" + o[t[n + 6]] + o[t[n + 7]] + "-" + o[t[n + 8]] + o[t[n + 9]] + "-" + o[t[n + 10]] + o[t[n + 11]] + o[t[n + 12]] + o[t[n + 13]] + o[t[n + 14]] + o[t[n + 15]]).toLowerCase();
}
let d;
const y = new Uint8Array(16);
function l() {
  if (!d) {
    if (typeof crypto > "u" || !crypto.getRandomValues)
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    d = crypto.getRandomValues.bind(crypto);
  }
  return d(y);
}
const h = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), m = { randomUUID: h };
function S(t, n, i) {
  if (m.randomUUID && !t)
    return m.randomUUID();
  t = t || {};
  const r = t.random ?? t.rng?.() ?? l();
  if (r.length < 16)
    throw new Error("Random bytes length must be >= 16");
  return r[6] = r[6] & 15 | 64, r[8] = r[8] & 63 | 128, x(r);
}
const f = {
  /**
   * Wrap an id in valid BSON syntax for objectIds in MongoDB
   * @param { string } value Required: The objectId to wrap in BSON
   * @returns { { $oid: string } } A BSON-wrapped ObjectId.
   */
  id: function(t) {
    return { $oid: t };
  },
  /**
   * Wrap a date in valid BSON syntax for MongoDB
   * @param { string } value Required: The date string to wrap in BSON
   * @returns { { $date: string } } A BSON-wrapped date.
   */
  date: function(t) {
    return { $date: t };
  }
}, g = {
  /**
   * Returns the default date
   * @returns { string } The current date and time formatted as an ISO string.
   */
  date: function() {
    return u(/* @__PURE__ */ new Date()).toISOString();
  }
}, w = {
  /**
   * Generates a unique MongoDB-compatible ObjectId
   * @returns {string} A new MongoDB ObjectId string.
   */
  generateObjectId: function() {
    const t = ((/* @__PURE__ */ new Date()).getTime() / 1e3 | 0).toString(16), n = "xxxxxxxxxxxxxxxx".replace(/x/g, () => (Math.random() * 16 | 0).toString(16)).toLowerCase();
    return `${t}${n}`;
  },
  /**
   * Generates a random uuid using uuid.v4()
   * @returns {string} A new v4 uuid string.
   */
  generateUuid: function() {
    return S();
  },
  // ALIASES
  wrap: f.id
  // ObjectId BSON wrapper
}, b = {
  /**
   * Compares two objects and returns an object containing only the differences
   * @param { Object } inputs
   * @param { Object } inputs.original Required: The value of this object are considered the default in this comparison.
   * @param { Object } inputs.updated Required: The value of this object will be returned as output if they're different from inputs.original.
   * @param { string } inputs.prefix Optional: Default is an empty string.
   * @returns { Object } An object containing only the differences between `inputs.original` and `inputs.updated`.
   */
  diff: function({ original: t, updated: n, prefix: i = "" }) {
    return !e.isObject(t) || !e.isObject(n) ? e.isEqual(t, n) ? {} : { [i.slice(0, -1)]: n } : e.isArray(t) && e.isArray(n) ? e.isEqual(t, n) ? {} : { [i.slice(0, -1)]: n } : e.transform(
      n,
      (r, s, c) => {
        const a = `${i}${c}`;
        if (!e.has(t, c))
          r[a] = s;
        else if (!e.isEqual(s, t[c]))
          if (e.isObject(s) && e.isObject(t[c])) {
            const p = this.diff({
              original: t[c],
              updated: s,
              prefix: `${a}.`
            });
            e.assign(r, p);
          } else
            r[a] = s;
      },
      {}
    );
  },
  /**
   * Check if an object has one or more properties
   * @param { Object } inputs
   * @param { Object } inputs.object Required: The object to check
   * @param { string[] } inputs.properties Required: An array of properties to check for
   * @returns { boolean } Returns true if at least one property if found, returns false otherwise.
   */
  hasProperties: function({ object: t, properties: n }) {
    return e.some(n, (i) => !e.isUndefined(e.get(t, i)));
  },
  /**
   * Recursively “unwrap” values that were wrapped by a `$…` object.
   *
   * @param {Object} obj – The object to strip.
   * @returns {Object}   – A new object with wrappers removed.
   * @throws {TypeError} – If `obj` is not a plain object.
   */
  strip: function(t, n = !1) {
    if (!e.isObjectLike(t) && n)
      throw new TypeError("strip expects an object");
    const i = {};
    for (const r of e.keys(t)) {
      const s = t[r];
      if (e.isArray(s)) {
        i[r] = e.cloneDeep(s);
        continue;
      }
      if (e.isObjectLike(s)) {
        const c = e.keys(s);
        if (e.size(c) === 1 && e.startsWith(c[0], "$")) {
          i[r] = s[c[0]];
          continue;
        }
        i[r] = this.strip(s, !0);
        continue;
      }
      i[r] = s;
    }
    return i;
  }
}, D = {
  /**
   * Checks if a string is unique within an array of strings
   * @param { Object } inputs
   * @param { string } inputs.string Required: The string to check for
   * @param { string[] } inputs.array Required: The array to check against
   * @returns { boolean } Returns true if the string isn't found in the array (meaning it would be unique if added to that array), returns false otherwise.
   */
  uniqueInArray: function({ string: t, array: n }) {
    return !new Set(n).has(t);
  }
}, I = {
  /**
   * Format a date in several standard formats
   * @param { Object } inputs
   * @param { string } inputs.date Required: The date to format
   * @param { "DayOnly" | "Timestamp" } inputs.type Required: The format type
   * @param { string } inputs.timezone Optional: The timezone to use for the DayOnly format
   * @returns { string } The formatted date as an ISO string.
   */
  format: function({ date: t, type: n, timezone: i = "America/Denver" }) {
    switch (n) {
      case "DayOnly":
        let r = u(t).format("YYYY-MM-DD");
        return u.tz(r, i).set({ hour: 6, minute: 0 }).toISOString();
      case "Timestamp":
        return u(t).toISOString();
      default:
        throw new Error(
          `${n}: This type isn't supported, please check your spelling.`
        );
    }
  },
  // ALIASES
  default: g.date,
  // Default for dates
  wrap: f.date
  // Date BSON wrapper
}, O = {
  /**
   * Checks if the value of an input is different from its default value
   * @param { Object } inputs
   * @param { ?string } inputs.value Required: The current value of the input
   * @param { ?string } inputs.initialData Required: The default value of the input
   * @param { Object & { primary: string } } inputs.theme Required: The current theme being used
   * @returns { ?string } If there's a difference, returns the HEX value to highlight the component. Otherwise, returns null.
   */
  inputDiff: function({ value: t, initialData: n, theme: i }) {
    return t !== n ? `${i.primary}40` : null;
  }
}, j = {
  id: w,
  object: b,
  string: D,
  date: I,
  behavior: O
};
export {
  j as default
};
