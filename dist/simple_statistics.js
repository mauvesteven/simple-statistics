(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ss = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// # simple-statistics
//
// A simple, literate statistics system.

var ss = module.exports = {};

ss.linearRegression = require('./src/linear_regression');
ss.linearRegressionLine = require('./src/linear_regression_line');
ss.standardDeviation = require('./src/standard_deviation');
ss.rSquared = require('./src/r_squared');
ss.median = require('./src/median');
ss.mean = ss.average = require('./src/mean');
ss.mode = require('./src/mode');
ss.min = require('./src/min');
ss.max = require('./src/max');
ss.sum = require('./src/sum');
ss.quantile = require('./src/quantile');
ss.quantileSorted = require('./src/quantile_sorted');
ss.iqr = ss.interquartileRange = require('./src/interquartile_range');
ss.medianAbsoluteDeviation = ss.mad = require('./src/mad');

ss.chunk = require('./src/chunk');
ss.shuffle = require('./src/shuffle');
ss.shuffleInPlace = require('./src/shuffle_in_place');

ss.sample = require('./src/sample');

ss.sampleCovariance = require('./src/sample_covariance');
ss.sampleCorrelation = require('./src/sample_correlation');
ss.sampleVariance = require('./src/sample_variance');
ss.sampleStandardDeviation = require('./src/sample_standard_deviation');
ss.sampleSkewness = require('./src/sample_skewness');

ss.geometricMean = require('./src/geometric_mean');
ss.harmonicMean = require('./src/harmonic_mean');
ss.rootMeanSquare = ss.rms = require('./src/root_mean_square');
ss.variance = require('./src/variance');
ss.tTest = require('./src/t_test');
ss.tTestTwoSample = require('./src/t_test_two_sample');
ss.jenks = require('./src/jenks');
ss.bayesian = require('./src/bayesian_classifier');
ss.perceptron = require('./src/perceptron');

// Distribution-related methods
ss.epsilon = require('./src/epsilon'); // We make ε available to the test suite.
ss.factorial = require('./src/factorial');
ss.bernoulliDistribution = require('./src/bernoulli_distribution');
ss.binomialDistribution = require('./src/binomial_distribution');
ss.poissonDistribution = require('./src/poisson_distribution');
ss.chiSquaredGoodnessOfFit = require('./src/chi_squared_goodness_of_fit');

// Normal distribution
ss.zScore = require('./src/z_score');
ss.cumulativeStdNormalProbability = require('./src/cumulative_std_normal_probability');
ss.standardNormalTable = require('./src/standard_normal_table');
ss.errorFunction = ss.erf = require('./src/error_function');
ss.inverseErrorFunction = require('./src/inverse_error_function');
ss.probit = require('./src/probit');

ss.mixin = require('./src/mixin');

},{"./src/bayesian_classifier":2,"./src/bernoulli_distribution":3,"./src/binomial_distribution":4,"./src/chi_squared_goodness_of_fit":6,"./src/chunk":7,"./src/cumulative_std_normal_probability":8,"./src/epsilon":9,"./src/error_function":10,"./src/factorial":11,"./src/geometric_mean":12,"./src/harmonic_mean":13,"./src/interquartile_range":14,"./src/inverse_error_function":15,"./src/jenks":16,"./src/linear_regression":19,"./src/linear_regression_line":20,"./src/mad":21,"./src/max":22,"./src/mean":23,"./src/median":24,"./src/min":25,"./src/mixin":26,"./src/mode":27,"./src/perceptron":28,"./src/poisson_distribution":29,"./src/probit":30,"./src/quantile":31,"./src/quantile_sorted":32,"./src/r_squared":33,"./src/root_mean_square":34,"./src/sample":35,"./src/sample_correlation":36,"./src/sample_covariance":37,"./src/sample_skewness":38,"./src/sample_standard_deviation":39,"./src/sample_variance":40,"./src/shuffle":41,"./src/shuffle_in_place":42,"./src/standard_deviation":43,"./src/standard_normal_table":44,"./src/sum":45,"./src/t_test":47,"./src/t_test_two_sample":48,"./src/variance":49,"./src/z_score":50}],2:[function(require,module,exports){
'use strict';

/**
 * [Bayesian Classifier](http://en.wikipedia.org/wiki/Naive_Bayes_classifier)
 *
 * This is a naïve bayesian classifier that takes
 * singly-nested objects.
 */
function BayesianClassifier() {
    // The number of items that are currently
    // classified in the model
    this.totalCount = 0;
    // Every item classified in the model
    this.data = {};
}

/**
 * ## Train
 * Train the classifier with a new item, which has a single
 * dimension of Javascript literal keys and values.
 *
 * @param {Object} item
 * @param {string} category
 */
BayesianClassifier.prototype.train = function(item, category) {
    // If the data object doesn't have any values
    // for this category, create a new object for it.
    if (!this.data[category]) {
        this.data[category] = {};
    }

    // Iterate through each key in the item.
    for (var k in item) {
        var v = item[k];
        // Initialize the nested object `data[category][k][item[k]]`
        // with an object of keys that equal 0.
        if (this.data[category][k] === undefined) {
            this.data[category][k] = {};
        }
        if (this.data[category][k][v] === undefined) {
            this.data[category][k][v] = 0;
        }

        // And increment the key for this key/value combination.
        this.data[category][k][item[k]]++;
    }

    // Increment the number of items classified
    this.totalCount++;
};

/**
 * Generate a score of how well this item matches all
 * possible categories based on its attributes
 *
 * @param {Object} item
 * @returns {Object} of probabilities that this item belongs to a
 * given category.
 */
BayesianClassifier.prototype.score = function(item) {
    // Initialize an empty array of odds per category.
    var odds = {}, category;
    // Iterate through each key in the item,
    // then iterate through each category that has been used
    // in previous calls to `.train()`
    for (var k in item) {
        var v = item[k];
        for (category in this.data) {
            // Create an empty object for storing key - value combinations
            // for this category.
            if (odds[category] === undefined) { odds[category] = {}; }

            // If this item doesn't even have a property, it counts for nothing,
            // but if it does have the property that we're looking for from
            // the item to categorize, it counts based on how popular it is
            // versus the whole population.
            if (this.data[category][k]) {
                odds[category][k + '_' + v] = (this.data[category][k][v] || 0) / this.totalCount;
            } else {
                odds[category][k + '_' + v] = 0;
            }
        }
    }

    // Set up a new object that will contain sums of these odds by category
    var oddsSums = {};

    for (category in odds) {
        // Tally all of the odds for each category-combination pair -
        // the non-existence of a category does not add anything to the
        // score.
        for (var combination in odds[category]) {
            if (oddsSums[category] === undefined) {
                oddsSums[category] = 0;
            }
            oddsSums[category] += odds[category][combination];
        }
    }

    return oddsSums;
};

module.exports = BayesianClassifier;

},{}],3:[function(require,module,exports){
'use strict';

var binomialDistribution = require('./binomial_distribution');

/**
 * The [Bernoulli distribution](http://en.wikipedia.org/wiki/Bernoulli_distribution)
 * is the probability discrete
 * distribution of a random variable which takes value 1 with success
 * probability `p` and value 0 with failure
 * probability `q` = 1 - `p`. It can be used, for example, to represent the
 * toss of a coin, where "1" is defined to mean "heads" and "0" is defined
 * to mean "tails" (or vice versa). It is
 * a special case of a Binomial Distribution
 * where `n` = 1.
 *
 * @param {number} p input value, between 0 and 1 inclusive
 * @returns {number} value of bernoulli distribution at this point
 */
function bernoulliDistribution(p) {
    // Check that `p` is a valid probability (0 ≤ p ≤ 1)
    if (p < 0 || p > 1 ) { return null; }

    return binomialDistribution(1, p);
}

module.exports = bernoulliDistribution;

},{"./binomial_distribution":4}],4:[function(require,module,exports){
'use strict';

var epsilon = require('./epsilon');
var factorial = require('./factorial');

/**
 * The [Binomial Distribution](http://en.wikipedia.org/wiki/Binomial_distribution) is the discrete probability
 * distribution of the number of successes in a sequence of n independent yes/no experiments, each of which yields
 * success with probability `probability`. Such a success/failure experiment is also called a Bernoulli experiment or
 * Bernoulli trial; when trials = 1, the Binomial Distribution is a Bernoulli Distribution.
 *
 * @param {number} trials number of trials to simulate
 * @param {number} probability
 * @returns {number} output
 */
function binomialDistribution(trials, probability) {
    // Check that `p` is a valid probability (0 ≤ p ≤ 1),
    // that `n` is an integer, strictly positive.
    if (probability < 0 || probability > 1 ||
        trials <= 0 || trials % 1 !== 0) {
        return null;
    }

    // We initialize `x`, the random variable, and `accumulator`, an accumulator
    // for the cumulative distribution function to 0. `distribution_functions`
    // is the object we'll return with the `probability_of_x` and the
    // `cumulativeProbability_of_x`, as well as the calculated mean &
    // variance. We iterate until the `cumulativeProbability_of_x` is
    // within `epsilon` of 1.0.
    var x = 0,
        cumulativeProbability = 0,
        cells = {};

    // This algorithm iterates through each potential outcome,
    // until the `cumulativeProbability` is very close to 1, at
    // which point we've defined the vast majority of outcomes
    do {
        // a [probability mass function](https://en.wikipedia.org/wiki/Probability_mass_function)
        cells[x] = factorial(trials) /
            (factorial(x) * factorial(trials - x)) *
            (Math.pow(probability, x) * Math.pow(1 - probability, trials - x));
        cumulativeProbability += cells[x];
        x++;
    // when the cumulativeProbability is nearly 1, we've calculated
    // the useful range of this distribution
    } while (cumulativeProbability < 1 - epsilon);

    return cells;
}

module.exports = binomialDistribution;

},{"./epsilon":9,"./factorial":11}],5:[function(require,module,exports){
'use strict';

/**
 * ## Percentage Points of the χ2 (Chi-Squared) Distribution
 *
 * The [χ2 (Chi-Squared) Distribution](http://en.wikipedia.org/wiki/Chi-squared_distribution) is used in the common
 * chi-squared tests for goodness of fit of an observed distribution to a theoretical one, the independence of two
 * criteria of classification of qualitative data, and in confidence interval estimation for a population standard
 * deviation of a normal distribution from a sample standard deviation.
 *
 * Values from Appendix 1, Table III of William W. Hines & Douglas C. Montgomery, "Probability and Statistics in
 * Engineering and Management Science", Wiley (1980).
 */
var chiSquaredDistributionTable = {
    1: { 0.995:  0.00, 0.99:  0.00, 0.975:  0.00, 0.95:  0.00, 0.9:  0.02, 0.5:  0.45, 0.1:  2.71, 0.05:  3.84, 0.025:  5.02, 0.01:  6.63, 0.005:  7.88 },
    2: { 0.995:  0.01, 0.99:  0.02, 0.975:  0.05, 0.95:  0.10, 0.9:  0.21, 0.5:  1.39, 0.1:  4.61, 0.05:  5.99, 0.025:  7.38, 0.01:  9.21, 0.005: 10.60 },
    3: { 0.995:  0.07, 0.99:  0.11, 0.975:  0.22, 0.95:  0.35, 0.9:  0.58, 0.5:  2.37, 0.1:  6.25, 0.05:  7.81, 0.025:  9.35, 0.01: 11.34, 0.005: 12.84 },
    4: { 0.995:  0.21, 0.99:  0.30, 0.975:  0.48, 0.95:  0.71, 0.9:  1.06, 0.5:  3.36, 0.1:  7.78, 0.05:  9.49, 0.025: 11.14, 0.01: 13.28, 0.005: 14.86 },
    5: { 0.995:  0.41, 0.99:  0.55, 0.975:  0.83, 0.95:  1.15, 0.9:  1.61, 0.5:  4.35, 0.1:  9.24, 0.05: 11.07, 0.025: 12.83, 0.01: 15.09, 0.005: 16.75 },
    6: { 0.995:  0.68, 0.99:  0.87, 0.975:  1.24, 0.95:  1.64, 0.9:  2.20, 0.5:  5.35, 0.1: 10.65, 0.05: 12.59, 0.025: 14.45, 0.01: 16.81, 0.005: 18.55 },
    7: { 0.995:  0.99, 0.99:  1.25, 0.975:  1.69, 0.95:  2.17, 0.9:  2.83, 0.5:  6.35, 0.1: 12.02, 0.05: 14.07, 0.025: 16.01, 0.01: 18.48, 0.005: 20.28 },
    8: { 0.995:  1.34, 0.99:  1.65, 0.975:  2.18, 0.95:  2.73, 0.9:  3.49, 0.5:  7.34, 0.1: 13.36, 0.05: 15.51, 0.025: 17.53, 0.01: 20.09, 0.005: 21.96 },
    9: { 0.995:  1.73, 0.99:  2.09, 0.975:  2.70, 0.95:  3.33, 0.9:  4.17, 0.5:  8.34, 0.1: 14.68, 0.05: 16.92, 0.025: 19.02, 0.01: 21.67, 0.005: 23.59 },
    10: { 0.995:  2.16, 0.99:  2.56, 0.975:  3.25, 0.95:  3.94, 0.9:  4.87, 0.5:  9.34, 0.1: 15.99, 0.05: 18.31, 0.025: 20.48, 0.01: 23.21, 0.005: 25.19 },
    11: { 0.995:  2.60, 0.99:  3.05, 0.975:  3.82, 0.95:  4.57, 0.9:  5.58, 0.5: 10.34, 0.1: 17.28, 0.05: 19.68, 0.025: 21.92, 0.01: 24.72, 0.005: 26.76 },
    12: { 0.995:  3.07, 0.99:  3.57, 0.975:  4.40, 0.95:  5.23, 0.9:  6.30, 0.5: 11.34, 0.1: 18.55, 0.05: 21.03, 0.025: 23.34, 0.01: 26.22, 0.005: 28.30 },
    13: { 0.995:  3.57, 0.99:  4.11, 0.975:  5.01, 0.95:  5.89, 0.9:  7.04, 0.5: 12.34, 0.1: 19.81, 0.05: 22.36, 0.025: 24.74, 0.01: 27.69, 0.005: 29.82 },
    14: { 0.995:  4.07, 0.99:  4.66, 0.975:  5.63, 0.95:  6.57, 0.9:  7.79, 0.5: 13.34, 0.1: 21.06, 0.05: 23.68, 0.025: 26.12, 0.01: 29.14, 0.005: 31.32 },
    15: { 0.995:  4.60, 0.99:  5.23, 0.975:  6.27, 0.95:  7.26, 0.9:  8.55, 0.5: 14.34, 0.1: 22.31, 0.05: 25.00, 0.025: 27.49, 0.01: 30.58, 0.005: 32.80 },
    16: { 0.995:  5.14, 0.99:  5.81, 0.975:  6.91, 0.95:  7.96, 0.9:  9.31, 0.5: 15.34, 0.1: 23.54, 0.05: 26.30, 0.025: 28.85, 0.01: 32.00, 0.005: 34.27 },
    17: { 0.995:  5.70, 0.99:  6.41, 0.975:  7.56, 0.95:  8.67, 0.9: 10.09, 0.5: 16.34, 0.1: 24.77, 0.05: 27.59, 0.025: 30.19, 0.01: 33.41, 0.005: 35.72 },
    18: { 0.995:  6.26, 0.99:  7.01, 0.975:  8.23, 0.95:  9.39, 0.9: 10.87, 0.5: 17.34, 0.1: 25.99, 0.05: 28.87, 0.025: 31.53, 0.01: 34.81, 0.005: 37.16 },
    19: { 0.995:  6.84, 0.99:  7.63, 0.975:  8.91, 0.95: 10.12, 0.9: 11.65, 0.5: 18.34, 0.1: 27.20, 0.05: 30.14, 0.025: 32.85, 0.01: 36.19, 0.005: 38.58 },
    20: { 0.995:  7.43, 0.99:  8.26, 0.975:  9.59, 0.95: 10.85, 0.9: 12.44, 0.5: 19.34, 0.1: 28.41, 0.05: 31.41, 0.025: 34.17, 0.01: 37.57, 0.005: 40.00 },
    21: { 0.995:  8.03, 0.99:  8.90, 0.975: 10.28, 0.95: 11.59, 0.9: 13.24, 0.5: 20.34, 0.1: 29.62, 0.05: 32.67, 0.025: 35.48, 0.01: 38.93, 0.005: 41.40 },
    22: { 0.995:  8.64, 0.99:  9.54, 0.975: 10.98, 0.95: 12.34, 0.9: 14.04, 0.5: 21.34, 0.1: 30.81, 0.05: 33.92, 0.025: 36.78, 0.01: 40.29, 0.005: 42.80 },
    23: { 0.995:  9.26, 0.99: 10.20, 0.975: 11.69, 0.95: 13.09, 0.9: 14.85, 0.5: 22.34, 0.1: 32.01, 0.05: 35.17, 0.025: 38.08, 0.01: 41.64, 0.005: 44.18 },
    24: { 0.995:  9.89, 0.99: 10.86, 0.975: 12.40, 0.95: 13.85, 0.9: 15.66, 0.5: 23.34, 0.1: 33.20, 0.05: 36.42, 0.025: 39.36, 0.01: 42.98, 0.005: 45.56 },
    25: { 0.995: 10.52, 0.99: 11.52, 0.975: 13.12, 0.95: 14.61, 0.9: 16.47, 0.5: 24.34, 0.1: 34.28, 0.05: 37.65, 0.025: 40.65, 0.01: 44.31, 0.005: 46.93 },
    26: { 0.995: 11.16, 0.99: 12.20, 0.975: 13.84, 0.95: 15.38, 0.9: 17.29, 0.5: 25.34, 0.1: 35.56, 0.05: 38.89, 0.025: 41.92, 0.01: 45.64, 0.005: 48.29 },
    27: { 0.995: 11.81, 0.99: 12.88, 0.975: 14.57, 0.95: 16.15, 0.9: 18.11, 0.5: 26.34, 0.1: 36.74, 0.05: 40.11, 0.025: 43.19, 0.01: 46.96, 0.005: 49.65 },
    28: { 0.995: 12.46, 0.99: 13.57, 0.975: 15.31, 0.95: 16.93, 0.9: 18.94, 0.5: 27.34, 0.1: 37.92, 0.05: 41.34, 0.025: 44.46, 0.01: 48.28, 0.005: 50.99 },
    29: { 0.995: 13.12, 0.99: 14.26, 0.975: 16.05, 0.95: 17.71, 0.9: 19.77, 0.5: 28.34, 0.1: 39.09, 0.05: 42.56, 0.025: 45.72, 0.01: 49.59, 0.005: 52.34 },
    30: { 0.995: 13.79, 0.99: 14.95, 0.975: 16.79, 0.95: 18.49, 0.9: 20.60, 0.5: 29.34, 0.1: 40.26, 0.05: 43.77, 0.025: 46.98, 0.01: 50.89, 0.005: 53.67 },
    40: { 0.995: 20.71, 0.99: 22.16, 0.975: 24.43, 0.95: 26.51, 0.9: 29.05, 0.5: 39.34, 0.1: 51.81, 0.05: 55.76, 0.025: 59.34, 0.01: 63.69, 0.005: 66.77 },
    50: { 0.995: 27.99, 0.99: 29.71, 0.975: 32.36, 0.95: 34.76, 0.9: 37.69, 0.5: 49.33, 0.1: 63.17, 0.05: 67.50, 0.025: 71.42, 0.01: 76.15, 0.005: 79.49 },
    60: { 0.995: 35.53, 0.99: 37.48, 0.975: 40.48, 0.95: 43.19, 0.9: 46.46, 0.5: 59.33, 0.1: 74.40, 0.05: 79.08, 0.025: 83.30, 0.01: 88.38, 0.005: 91.95 },
    70: { 0.995: 43.28, 0.99: 45.44, 0.975: 48.76, 0.95: 51.74, 0.9: 55.33, 0.5: 69.33, 0.1: 85.53, 0.05: 90.53, 0.025: 95.02, 0.01: 100.42, 0.005: 104.22 },
    80: { 0.995: 51.17, 0.99: 53.54, 0.975: 57.15, 0.95: 60.39, 0.9: 64.28, 0.5: 79.33, 0.1: 96.58, 0.05: 101.88, 0.025: 106.63, 0.01: 112.33, 0.005: 116.32 },
    90: { 0.995: 59.20, 0.99: 61.75, 0.975: 65.65, 0.95: 69.13, 0.9: 73.29, 0.5: 89.33, 0.1: 107.57, 0.05: 113.14, 0.025: 118.14, 0.01: 124.12, 0.005: 128.30 },
    100: { 0.995: 67.33, 0.99: 70.06, 0.975: 74.22, 0.95: 77.93, 0.9: 82.36, 0.5: 99.33, 0.1: 118.50, 0.05: 124.34, 0.025: 129.56, 0.01: 135.81, 0.005: 140.17 }
};

module.exports = chiSquaredDistributionTable;

},{}],6:[function(require,module,exports){
'use strict';

var mean = require('./mean');
var chiSquaredDistributionTable = require('./chi_squared_distribution_table');

/**
 * The [χ2 (Chi-Squared) Goodness-of-Fit Test](http://en.wikipedia.org/wiki/Goodness_of_fit#Pearson.27s_chi-squared_test)
 * uses a measure of goodness of fit which is the sum of differences between observed and expected outcome frequencies
 * (that is, counts of observations), each squared and divided by the number of observations expected given the
 * hypothesized distribution. The resulting χ2 statistic, `chiSquared`, can be compared to the chi-squared distribution
 * to determine the goodness of fit. In order to determine the degrees of freedom of the chi-squared distribution, one
 * takes the total number of observed frequencies and subtracts the number of estimated parameters. The test statistic
 * follows, approximately, a chi-square distribution with (k − c) degrees of freedom where `k` is the number of non-empty
 * cells and `c` is the number of estimated parameters for the distribution.
 *
 * @param {Array<number>} data
 * @param {Function} distributionType a function that returns a point in a distribution:
 * for instance, binomial, bernoulli, or poisson
 * @param {number} significance
 * @returns {number} chi squared goodness of fit
 */
function chiSquaredGoodnessOfFit(data, distributionType, significance) {
    // Estimate from the sample data, a weighted mean.
    var inputMean = mean(data),
        // Calculated value of the χ2 statistic.
        chiSquared = 0,
        // Degrees of freedom, calculated as (number of class intervals -
        // number of hypothesized distribution parameters estimated - 1)
        degreesOfFreedom,
        // Number of hypothesized distribution parameters estimated, expected to be supplied in the distribution test.
        // Lose one degree of freedom for estimating `lambda` from the sample data.
        c = 1,
        // The hypothesized distribution.
        // Generate the hypothesized distribution.
        hypothesizedDistribution = distributionType(inputMean),
        observedFrequencies = [],
        expectedFrequencies = [],
        k;

    // Create an array holding a histogram from the sample data, of
    // the form `{ value: numberOfOcurrences }`
    for (var i = 0; i < data.length; i++) {
        if (observedFrequencies[data[i]] === undefined) {
            observedFrequencies[data[i]] = 0;
        }
        observedFrequencies[data[i]]++;
    }

    // The histogram we created might be sparse - there might be gaps
    // between values. So we iterate through the histogram, making
    // sure that instead of undefined, gaps have 0 values.
    for (i = 0; i < observedFrequencies.length; i++) {
        if (observedFrequencies[i] === undefined) {
            observedFrequencies[i] = 0;
        }
    }

    // Create an array holding a histogram of expected data given the
    // sample size and hypothesized distribution.
    for (k in hypothesizedDistribution) {
        if (k in observedFrequencies) {
            expectedFrequencies[k] = hypothesizedDistribution[k] * data.length;
        }
    }

    // Working backward through the expected frequencies, collapse classes
    // if less than three observations are expected for a class.
    // This transformation is applied to the observed frequencies as well.
    for (k = expectedFrequencies.length - 1; k >= 0; k--) {
        if (expectedFrequencies[k] < 3) {
            expectedFrequencies[k - 1] += expectedFrequencies[k];
            expectedFrequencies.pop();

            observedFrequencies[k - 1] += observedFrequencies[k];
            observedFrequencies.pop();
        }
    }

    // Iterate through the squared differences between observed & expected
    // frequencies, accumulating the `chiSquared` statistic.
    for (k = 0; k < observedFrequencies.length; k++) {
        chiSquared += Math.pow(
            observedFrequencies[k] - expectedFrequencies[k], 2) /
            expectedFrequencies[k];
    }

    // Calculate degrees of freedom for this test and look it up in the
    // `chiSquaredDistributionTable` in order to
    // accept or reject the goodness-of-fit of the hypothesized distribution.
    degreesOfFreedom = observedFrequencies.length - c - 1;
    return chiSquaredDistributionTable[degreesOfFreedom][significance] < chiSquared;
}

module.exports = chiSquaredGoodnessOfFit;

},{"./chi_squared_distribution_table":5,"./mean":23}],7:[function(require,module,exports){
'use strict';

/**
 * Split an array into chunks of a specified size. This function
 * has the same behavior as [PHP's array_chunk](http://php.net/manual/en/function.array-chunk.php)
 * function, and thus will insert smaller-sized chunks at the end if
 * the input size is not divisible by the chunk size.
 *
 * `sample` is expected to be an array, and `chunkSize` a number.
 * The `sample` array can contain any kind of data.
 *
 * @param {Array} sample
 * @param {number} chunkSize size of each output array
 * @example
 * console.log(chunk([1, 2, 3, 4], 2)); // [[1, 2], [3, 4]]
 */
function chunk(sample, chunkSize) {

    // a list of result chunks, as arrays in an array
    var output = [];

    // `chunkSize` must be zero or higher - otherwise the loop below,
    // in which we call `start += chunkSize`, will loop infinitely.
    // So, we'll detect and return null in that case to indicate
    // invalid input.
    if (chunkSize <= 0) {
        return null;
    }

    // `start` is the index at which `.slice` will start selecting
    // new array elements
    for (var start = 0; start < sample.length; start += chunkSize) {

        // for each chunk, slice that part of the array and add it
        // to the output. The `.slice` function does not change
        // the original array.
        output.push(sample.slice(start, start + chunkSize));
    }
    return output;
}

module.exports = chunk;

},{}],8:[function(require,module,exports){
'use strict';

var standardNormalTable = require('./standard_normal_table');

/**
 * ## [Cumulative Standard Normal Probability](http://en.wikipedia.org/wiki/Standard_normal_table)
 *
 * Since probability tables cannot be
 * printed for every normal distribution, as there are an infinite variety
 * of normal distributions, it is common practice to convert a normal to a
 * standard normal and then use the standard normal table to find probabilities.
 *
 * You can use `.5 + .5 * errorFunction(x / Math.sqrt(2))` to calculate the probability
 * instead of looking it up in a table.
 *
 * @param {number} z
 * @returns {number} cumulative standard normal probability
 */
function cumulativeStdNormalProbability(z) {

    // Calculate the position of this value.
    var absZ = Math.abs(z),
        // Each row begins with a different
        // significant digit: 0.5, 0.6, 0.7, and so on. Each value in the table
        // corresponds to a range of 0.01 in the input values, so the value is
        // multiplied by 100.
        index = Math.min(Math.round(absZ * 100), standardNormalTable.length - 1);

    // The index we calculate must be in the table as a positive value,
    // but we still pay attention to whether the input is positive
    // or negative, and flip the output value as a last step.
    if (z >= 0) {
        return standardNormalTable[index];
    } else {
        // due to floating-point arithmetic, values in the table with
        // 4 significant figures can nevertheless end up as repeating
        // fractions when they're computed here.
        return +(1 - standardNormalTable[index]).toFixed(4);
    }
}

module.exports = cumulativeStdNormalProbability;

},{"./standard_normal_table":44}],9:[function(require,module,exports){
'use strict';

/**
 * We use `ε`, epsilon, as a stopping criterion when we want to iterate
 * until we're "close enough".
 */
var epsilon = 0.0001;

module.exports = epsilon;

},{}],10:[function(require,module,exports){
'use strict';

/**
 * ## [Gaussian error function](http://en.wikipedia.org/wiki/Error_function)
 *
 * The `errorFunction(x/(sd * Math.sqrt(2)))` is the probability that a value in a
 * normal distribution with standard deviation sd is within x of the mean.
 *
 * This function returns a numerical approximation to the exact value.
 *
 * @param {number} x input
 * @return {number}
 */
function errorFunction(x) {
    var t = 1 / (1 + 0.5 * Math.abs(x));
    var tau = t * Math.exp(-Math.pow(x, 2) -
        1.26551223 +
        1.00002368 * t +
        0.37409196 * Math.pow(t, 2) +
        0.09678418 * Math.pow(t, 3) -
        0.18628806 * Math.pow(t, 4) +
        0.27886807 * Math.pow(t, 5) -
        1.13520398 * Math.pow(t, 6) +
        1.48851587 * Math.pow(t, 7) -
        0.82215223 * Math.pow(t, 8) +
        0.17087277 * Math.pow(t, 9));
    if (x >= 0) {
        return 1 - tau;
    } else {
        return tau - 1;
    }
}

module.exports = errorFunction;

},{}],11:[function(require,module,exports){
'use strict';

/**
 * ## [Factorial](https://en.wikipedia.org/wiki/Factorial)
 *
 * A factorial, usually written n!, is the product of all positive
 * integers less than or equal to n. Often factorial is implemented
 * recursively, but this iterative approach is significantly faster
 * and simpler.
 *
 * @param {number} n input
 * @returns {number} factorial: n!
 * @example
 * console.log(factorial(5)); // 120
 */
function factorial(n) {

    // factorial is mathematically undefined for negative numbers
    if (n < 0 ) { return null; }

    // typically you'll expand the factorial function going down, like
    // 5! = 5 * 4 * 3 * 2 * 1. This is going in the opposite direction,
    // counting from 2 up to the number in question, and since anything
    // multiplied by 1 is itself, the loop only needs to start at 2.
    var accumulator = 1;
    for (var i = 2; i <= n; i++) {
        // for each number up to and including the number `n`, multiply
        // the accumulator my that number.
        accumulator *= i;
    }
    return accumulator;
}

module.exports = factorial;

},{}],12:[function(require,module,exports){
'use strict';

/**
 * The [Geometric Mean](https://en.wikipedia.org/wiki/Geometric_mean) is
 * a mean function that is more useful for numbers in different
 * ranges.
 *
 * this is the nth root of the input numbers multiplied by each other
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input array
 * @returns {number} geometric mean
 */
function geometricMean(x) {
    // The mean of no numbers is null
    if (x.length === 0) { return null; }

    // the starting value.
    var value = 1;

    for (var i = 0; i < x.length; i++) {
        // the geometric mean is only valid for positive numbers
        if (x[i] <= 0) { return null; }

        // repeatedly multiply the value by each number
        value *= x[i];
    }

    return Math.pow(value, 1 / x.length);
}

module.exports = geometricMean;

},{}],13:[function(require,module,exports){
'use strict';

/**
 * The [Harmonic Mean](https://en.wikipedia.org/wiki/Harmonic_mean) is
 * a mean function typically used to find the average of rates
 *
 * this is the reciprocal of the arithmetic mean of the reciprocals
 * of the input numbers
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @returns {number} harmonic mean
 */
function harmonicMean(x) {
    // The mean of no numbers is null
    if (x.length === 0) { return null; }

    var reciprocalSum = 0;

    for (var i = 0; i < x.length; i++) {
        // the harmonic mean is only valid for positive numbers
        if (x[i] <= 0) { return null; }

        reciprocalSum += 1 / x[i];
    }

    // divide n by the the reciprocal sum
    return x.length / reciprocalSum;
}

module.exports = harmonicMean;

},{}],14:[function(require,module,exports){
'use strict';

var quantile = require('./quantile');

/**
 * The [Interquartile range](http://en.wikipedia.org/wiki/Interquartile_range) is
 * a measure of statistical dispersion, or how scattered, spread, or
 * concentrated a distribution is. It's computed as the difference between
 * the third quartile and first quartile.
 *
 * @param {Array<number>} sample
 * @returns {number} interquartile range: the span between lower and upper quartile,
 * 0.25 and 0.75
 */
function interquartileRange(sample) {
    // We can't derive quantiles from an empty list
    if (sample.length === 0) { return null; }

    // Interquartile range is the span between the upper quartile,
    // at `0.75`, and lower quartile, `0.25`
    return quantile(sample, 0.75) - quantile(sample, 0.25);
}

module.exports = interquartileRange;

},{"./quantile":31}],15:[function(require,module,exports){
'use strict';

/**
 * The Inverse [Gaussian error function](http://en.wikipedia.org/wiki/Error_function)
 * returns a numerical approximation to the value that would have caused
 * `errorFunction()` to return x.
 *
 * @param {number} x value of error function
 * @returns {number} estimated inverted value
 */
function inverseErrorFunction(x) {
    var a = (8 * (Math.PI - 3)) / (3 * Math.PI * (4 - Math.PI));

    var inv = Math.sqrt(Math.sqrt(
            Math.pow(2 / (Math.PI * a) + Math.log(1 - x * x) / 2, 2) -
            Math.log(1 - x * x) / a) -
            (2 / (Math.PI * a) + Math.log(1 - x * x) / 2));

    if (x >= 0) {
        return inv;
    } else {
        return -inv;
    }
}

module.exports = inverseErrorFunction;

},{}],16:[function(require,module,exports){
'use strict';

var jenksBreaks = require('./jenks_breaks');
var jenksMatrices = require('./jenks_matrices');

/**
 * ## [Jenks natural breaks optimization](http://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization)
 *
 * @param {Array<number>} data input data, as an array of number values
 * @param {number} nClasses number of desired classes
 * @returns {Array<number>} array of class break positions
 */
function jenks(data, nClasses) {

    if (nClasses > data.length) { return null; }

    // sort data in numerical order, since this is expected
    // by the matrices function
    data = data.slice().sort(function (a, b) { return a - b; });

    // get our basic matrices
    var matrices = jenksMatrices(data, nClasses),
        // we only need lower class limits here
        lowerClassLimits = matrices.lowerClassLimits;

    // extract nClasses out of the computed matrices
    return jenksBreaks(data, lowerClassLimits, nClasses);
}

module.exports = jenks;

},{"./jenks_breaks":17,"./jenks_matrices":18}],17:[function(require,module,exports){
'use strict';

/**
 * ## Pull Breaks Values for Jenks
 *
 * the second part of the jenks recipe: take the calculated matrices
 * and derive an array of n breaks.
 *
 * @private
 */
function jenksBreaks(data, lowerClassLimits, nClasses) {

    var k = data.length,
        kclass = [],
        countNum = nClasses;

    // the calculation of classes will never include the upper
    // bound, so we need to explicitly set it
    kclass[nClasses] = data[data.length - 1];

    // the lowerClassLimits matrix is used as indices into itself
    // here: the `k` variable is reused in each iteration.
    while (countNum > 0) {
        kclass[countNum - 1] = data[lowerClassLimits[k][countNum] - 1];
        k = lowerClassLimits[k][countNum] - 1;
        countNum--;
    }

    return kclass;
}

module.exports = jenksBreaks;

},{}],18:[function(require,module,exports){
'use strict';

/**
 * ## Compute Matrices for Jenks
 *
 * Compute the matrices required for Jenks breaks. These matrices
 * can be used for any classing of data with `classes <= nClasses`
 *
 * @private
 */
function jenksMatrices(data, nClasses) {

    // in the original implementation, these matrices are referred to
    // as `LC` and `OP`
    //
    // * lowerClassLimits (LC): optimal lower class limits
    // * varianceCombinations (OP): optimal variance combinations for all classes
    var lowerClassLimits = [],
        varianceCombinations = [],
        // loop counters
        i, j,
        // the variance, as computed at each step in the calculation
        variance = 0;

    // Initialize and fill each matrix with zeroes
    for (i = 0; i < data.length + 1; i++) {
        var tmp1 = [], tmp2 = [];
        // despite these arrays having the same values, we need
        // to keep them separate so that changing one does not change
        // the other
        for (j = 0; j < nClasses + 1; j++) {
            tmp1.push(0);
            tmp2.push(0);
        }
        lowerClassLimits.push(tmp1);
        varianceCombinations.push(tmp2);
    }

    for (i = 1; i < nClasses + 1; i++) {
        lowerClassLimits[1][i] = 1;
        varianceCombinations[1][i] = 0;
        // in the original implementation, 9999999 is used but
        // since Javascript has `Infinity`, we use that.
        for (j = 2; j < data.length + 1; j++) {
            varianceCombinations[j][i] = Infinity;
        }
    }

    for (var l = 2; l < data.length + 1; l++) {

        // `SZ` originally. this is the sum of the values seen thus
        // far when calculating variance.
        var sum = 0,
            // `ZSQ` originally. the sum of squares of values seen
            // thus far
            sumSquares = 0,
            // `WT` originally. This is the number of
            w = 0,
            // `IV` originally
            i4 = 0;

        // in several instances, you could say `Math.pow(x, 2)`
        // instead of `x * x`, but this is slower in some browsers
        // introduces an unnecessary concept.
        for (var m = 1; m < l + 1; m++) {

            // `III` originally
            var lowerClassLimit = l - m + 1,
                val = data[lowerClassLimit - 1];

            // here we're estimating variance for each potential classing
            // of the data, for each potential number of classes. `w`
            // is the number of data points considered so far.
            w++;

            // increase the current sum and sum-of-squares
            sum += val;
            sumSquares += val * val;

            // the variance at this point in the sequence is the difference
            // between the sum of squares and the total x 2, over the number
            // of samples.
            variance = sumSquares - (sum * sum) / w;

            i4 = lowerClassLimit - 1;

            if (i4 !== 0) {
                for (j = 2; j < nClasses + 1; j++) {
                    // if adding this element to an existing class
                    // will increase its variance beyond the limit, break
                    // the class at this point, setting the `lowerClassLimit`
                    // at this point.
                    if (varianceCombinations[l][j] >=
                        (variance + varianceCombinations[i4][j - 1])) {
                        lowerClassLimits[l][j] = lowerClassLimit;
                        varianceCombinations[l][j] = variance +
                            varianceCombinations[i4][j - 1];
                    }
                }
            }
        }

        lowerClassLimits[l][1] = 1;
        varianceCombinations[l][1] = variance;
    }

    // return the two matrices. for just providing breaks, only
    // `lowerClassLimits` is needed, but variances can be useful to
    // evaluate goodness of fit.
    return {
        lowerClassLimits: lowerClassLimits,
        varianceCombinations: varianceCombinations
    };
}

module.exports = jenksMatrices;

},{}],19:[function(require,module,exports){
'use strict';

/**
 * [Linear Regression](http://en.wikipedia.org/wiki/Linear_regression)
 *
 * [Simple linear regression](http://en.wikipedia.org/wiki/Simple_linear_regression)
 * is a simple way to find a fitted line
 * between a set of coordinates.
 *
 * Calculate the slope and y-intercept of the regression line
 * by calculating the least sum of squares
 *
 * @param {Array<Array<number>>} data an array of two-element of arrays,
 * like `[[0, 1], [2, 3]]`
 * @returns {Object} object containing slope and intersect of regression line
 */
function linearRegression(data) {

    var m, b;

    // Store data length in a local variable to reduce
    // repeated object property lookups
    var dataLength = data.length;

    //if there's only one point, arbitrarily choose a slope of 0
    //and a y-intercept of whatever the y of the initial point is
    if (dataLength === 1) {
        m = 0;
        b = data[0][1];
    } else {
        // Initialize our sums and scope the `m` and `b`
        // variables that define the line.
        var sumX = 0, sumY = 0,
            sumXX = 0, sumXY = 0;

        // Use local variables to grab point values
        // with minimal object property lookups
        var point, x, y;

        // Gather the sum of all x values, the sum of all
        // y values, and the sum of x^2 and (x*y) for each
        // value.
        //
        // In math notation, these would be SS_x, SS_y, SS_xx, and SS_xy
        for (var i = 0; i < dataLength; i++) {
            point = data[i];
            x = point[0];
            y = point[1];

            sumX += x;
            sumY += y;

            sumXX += x * x;
            sumXY += x * y;
        }

        // `m` is the slope of the regression line
        m = ((dataLength * sumXY) - (sumX * sumY)) /
            ((dataLength * sumXX) - (sumX * sumX));

        // `b` is the y-intercept of the line.
        b = (sumY / dataLength) - ((m * sumX) / dataLength);
    }

    // Return both values as an object.
    return {
        m: m,
        b: b
    };
}


module.exports = linearRegression;

},{}],20:[function(require,module,exports){
'use strict';

/**
 * ## Fitting The Regression Line
 *
 * This is called after `.data()` and returns the
 * equation `y = f(x)` which gives the position
 * of the regression line at each point in `x`.
 *
 * @param {Object} mb object with `m` and `b` members, representing
 * slope and intersect of desired line
 * @returns {Function} method that computes y-value at any given
 * x-value on the line.
 */
function linearRegressionLine(mb) {
    // Get the slope, `m`, and y-intercept, `b`, of the line.
    var m = mb.m,
        b = mb.b;

    // Return a function that computes a `y` value for each
    // x value it is given, based on the values of `b` and `a`
    // that we just computed.
    return function(x) {
        return b + (m * x);
    };
}

module.exports = linearRegressionLine;

},{}],21:[function(require,module,exports){
'use strict';

var median = require('./median');

/**
 * The [Median Absolute Deviation](http://en.wikipedia.org/wiki/Median_absolute_deviation) is
 * a robust measure of statistical
 * dispersion. It is more resilient to outliers than the standard deviation.
 *
 * @param {Array<number>} x input array
 * @returns {number} median absolute deviation
 */
function mad(x) {
    // The mad of nothing is null
    if (!x || x.length === 0) { return null; }

    var medianValue = median(x),
        medianAbsoluteDeviations = [];

    // Make a list of absolute deviations from the median
    for (var i = 0; i < x.length; i++) {
        medianAbsoluteDeviations.push(Math.abs(x[i] - medianValue));
    }

    // Find the median value of that list
    return median(medianAbsoluteDeviations);
}

module.exports = mad;

},{"./median":24}],22:[function(require,module,exports){
'use strict';

/**
 * This computes the maximum number in an array.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @returns {number} maximum value
 * @example
 * console.log(max([1, 2, 3, 4])); // 4
 */
function max(x) {
    var value;
    for (var i = 0; i < x.length; i++) {
        // On the first iteration of this loop, max is
        // undefined and is thus made the maximum element in the array
        if (x[i] > value || value === undefined) {
            value = x[i];
        }
    }
    return value;
}

module.exports = max;

},{}],23:[function(require,module,exports){
'use strict';

var sum = require('./sum');

/**
 * The mean, _also known as average_,
 * is the sum over the number of values.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input values
 * @returns {number} mean
 * @example
 * console.log(mean([0, 10])); // 5
 */
function mean(x) {
    // The mean of no numbers is null
    if (x.length === 0) { return null; }

    return sum(x) / x.length;
}

module.exports = mean;

},{"./sum":45}],24:[function(require,module,exports){
'use strict';

/**
 * The [median](http://en.wikipedia.org/wiki/Median) is
 * the middle number of a list. This is often a good indicator of 'the middle'
 * when there are outliers that skew the `mean()` value.
 *
 * @param {Array<number>} x input
 * @returns {number} median value
 */
function median(x) {
    // The median of an empty list is null
    if (x.length === 0) { return null; }

    // Sorting the array makes it easy to find the center, but
    // use `.slice()` to ensure the original array `x` is not modified
    var sorted = x.slice().sort(function (i, j) { return i - j; });

    // If the length of the list is odd, it's the central number
    if (sorted.length % 2 === 1) {
        return sorted[(sorted.length - 1) / 2];
    // Otherwise, the median is the average of the two numbers
    // at the center of the list
    } else {
        var a = sorted[(sorted.length / 2) - 1];
        var b = sorted[(sorted.length / 2)];
        return (a + b) / 2;
    }
}

module.exports = median;

},{}],25:[function(require,module,exports){
'use strict';

/**
 * The min is the lowest number in the array.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @returns {number} minimum value
 */
function min(x) {
    var value;
    for (var i = 0; i < x.length; i++) {
        // On the first iteration of this loop, min is
        // undefined and is thus made the minimum element in the array
        if (x[i] < value || value === undefined) {
            value = x[i];
        }
    }
    return value;
}

module.exports = min;

},{}],26:[function(require,module,exports){
'use strict';

/**
 * # Mixin
 *
 * Mixin simple_statistics to a single Array instance if provided
 * or the Array native object if not. This is an optional
 * feature that lets you treat simple_statistics as a native feature
 * of Javascript.
 */
function mixin(ss, array) {
    var support = !!(Object.defineProperty && Object.defineProperties);
    // Coverage testing will never test this error.
    /* istanbul ignore next */
    if (!support) {
        throw new Error('without defineProperty, simple-statistics cannot be mixed in');
    }

    // only methods which work on basic arrays in a single step
    // are supported
    var arrayMethods = ['median', 'standardDeviation', 'sum',
        'sampleSkewness',
        'mean', 'min', 'max', 'quantile', 'geometricMean',
        'harmonicMean', 'root_mean_square'];

    // create a closure with a method name so that a reference
    // like `arrayMethods[i]` doesn't follow the loop increment
    function wrap(method) {
        return function() {
            // cast any arguments into an array, since they're
            // natively objects
            var args = Array.prototype.slice.apply(arguments);
            // make the first argument the array itself
            args.unshift(this);
            // return the result of the ss method
            return ss[method].apply(ss, args);
        };
    }

    // select object to extend
    var extending;
    if (array) {
        // create a shallow copy of the array so that our internal
        // operations do not change it by reference
        extending = array.slice();
    } else {
        extending = Array.prototype;
    }

    // for each array function, define a function that gets
    // the array as the first argument.
    // We use [defineProperty](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty)
    // because it allows these properties to be non-enumerable:
    // `for (var in x)` loops will not run into problems with this
    // implementation.
    for (var i = 0; i < arrayMethods.length; i++) {
        Object.defineProperty(extending, arrayMethods[i], {
            value: wrap(arrayMethods[i]),
            configurable: true,
            enumerable: false,
            writable: true
        });
    }

    return extending;
}

module.exports = mixin;

},{}],27:[function(require,module,exports){
'use strict';

/**
 * The [mode](http://bit.ly/W5K4Yt) is the number that appears in a list the highest number of times.
 * There can be multiple modes in a list: in the event of a tie, this
 * algorithm will return the most recently seen mode.
 *
 * This implementation is inspired by [science.js](https://github.com/jasondavies/science.js/blob/master/src/stats/mode.js)
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @returns {number} mode
 */
function mode(x) {

    // Handle edge cases:
    // The median of an empty list is null
    if (x.length === 0) { return null; }
    else if (x.length === 1) { return x[0]; }

    // Sorting the array lets us iterate through it below and be sure
    // that every time we see a new number it's new and we'll never
    // see the same number twice
    var sorted = x.slice().sort(function (a, b) { return a - b; });

    // This assumes it is dealing with an array of size > 1, since size
    // 0 and 1 are handled immediately. Hence it starts at index 1 in the
    // array.
    var last = sorted[0],
        // store the mode as we find new modes
        value,
        // store how many times we've seen the mode
        maxSeen = 0,
        // how many times the current candidate for the mode
        // has been seen
        seenThis = 1;

    // end at sorted.length + 1 to fix the case in which the mode is
    // the highest number that occurs in the sequence. the last iteration
    // compares sorted[i], which is undefined, to the highest number
    // in the series
    for (var i = 1; i < sorted.length + 1; i++) {
        // we're seeing a new number pass by
        if (sorted[i] !== last) {
            // the last number is the new mode since we saw it more
            // often than the old one
            if (seenThis > maxSeen) {
                maxSeen = seenThis;
                value = last;
            }
            seenThis = 1;
            last = sorted[i];
        // if this isn't a new number, it's one more occurrence of
        // the potential mode
        } else { seenThis++; }
    }
    return value;
}

module.exports = mode;

},{}],28:[function(require,module,exports){
'use strict';

/**
 * ## [Perceptron Classifier](http://en.wikipedia.org/wiki/Perceptron)
 *
 * This is a single-layer perceptron classifier that takes
 * arrays of numbers and predicts whether they should be classified
 * as either 0 or 1 (negative or positive examples).
 */
function PerceptronModel() {
    // The weights, or coefficients of the model;
    // weights are only populated when training with data.
    this.weights = [];
    // The bias term, or intercept; it is also a weight but
    // it's stored separately for convenience as it is always
    // multiplied by one.
    this.bias = 0;
}

/**
 * ## Predict
 *
 * Use an array of features with the weight array and bias
 * to predict whether an example is labeled 0 or 1.
 *
 * @param {Array} features
 * @returns {number} 1 if the score is over 0, otherwise 0
 */
PerceptronModel.prototype.predict = function(features) {

    // Only predict if previously trained
    // on the same size feature array(s).
    if (features.length !== this.weights.length) { return null; }

    // Calculate the sum of features times weights,
    // with the bias added (implicitly times one).
    var score = 0;
    for (var i = 0; i < this.weights.length; i++) {
        score += this.weights[i] * features[i];
    }
    score += this.bias;

    // Classify as 1 if the score is over 0, otherwise 0.
    return score > 0 ? 1 : 0;
};

/**
 * ## Train
 * Train the classifier with a new example, which is
 * a numeric array of features and a 0 or 1 label.
 *
 * @param {Array} features
 * @param {number} label either 0 or 1
 * @returns {PerceptronModel} this
 */
PerceptronModel.prototype.train = function(features, label) {
    // Require that only labels of 0 or 1 are considered.
    if (label !== 0 && label !== 1) { return null; }
    // The length of the feature array determines
    // the length of the weight array.
    // The perceptron will continue learning as long as
    // it keeps seeing feature arrays of the same length.
    // When it sees a new data shape, it initializes.
    if (features.length !== this.weights.length) {
        this.weights = features;
        this.bias = 1;
    }
    // Make a prediction based on current weights.
    var prediction = this.predict(features);
    // Update the weights if the prediction is wrong.
    if (prediction !== label) {
        var gradient = label - prediction;
        for (var i = 0; i < this.weights.length; i++) {
            this.weights[i] += gradient * features[i];
        }
        this.bias += gradient;
    }
    return this;
};

module.exports = PerceptronModel;

},{}],29:[function(require,module,exports){
'use strict';

var epsilon = require('./epsilon');
var factorial = require('./factorial');

/**
 * The [Poisson Distribution](http://en.wikipedia.org/wiki/Poisson_distribution)
 * is a discrete probability distribution that expresses the probability
 * of a given number of events occurring in a fixed interval of time
 * and/or space if these events occur with a known average rate and
 * independently of the time since the last event.
 *
 * The Poisson Distribution is characterized by the strictly positive
 * mean arrival or occurrence rate, `λ`.
 *
 * @param {number} position location poisson distribution
 * @returns {number} value of poisson distribution at that point
 */
function poissonDistribution(lambda) {
    // Check that lambda is strictly positive
    if (lambda <= 0) { return null; }

    // our current place in the distribution
    var x = 0,
        // and we keep track of the current cumulative probability, in
        // order to know when to stop calculating chances.
        cumulativeProbability = 0,
        // the calculated cells to be returned
        cells = {};

    // This algorithm iterates through each potential outcome,
    // until the `cumulativeProbability` is very close to 1, at
    // which point we've defined the vast majority of outcomes
    do {
        // a [probability mass function](https://en.wikipedia.org/wiki/Probability_mass_function)
        cells[x] = (Math.pow(Math.E, -lambda) * Math.pow(lambda, x)) / factorial(x);
        cumulativeProbability += cells[x];
        x++;
    // when the cumulativeProbability is nearly 1, we've calculated
    // the useful range of this distribution
    } while (cumulativeProbability < 1 - epsilon);

    return cells;
}

module.exports = poissonDistribution;

},{"./epsilon":9,"./factorial":11}],30:[function(require,module,exports){
'use strict';

var epsilon = require('./epsilon');
var inverseErrorFunction = require('./inverse_error_function');

/**
 * The [Probit](http://en.wikipedia.org/wiki/Probit)
 * is the inverse of cumulativeStdNormalProbability(),
 * and is also known as the normal quantile function.
 *
 * It returns the number of standard deviations from the mean
 * where the p'th quantile of values can be found in a normal distribution.
 * So, for example, probit(0.5 + 0.6827/2) ≈ 1 because 68.27% of values are
 * normally found within 1 standard deviation above or below the mean.
 *
 * @param {number} p
 * @returns {number} probit
 */
function probit(p) {
    if (p === 0) {
        p = epsilon;
    } else if (p >= 1) {
        p = 1 - epsilon;
    }
    return Math.sqrt(2) * inverseErrorFunction(2 * p - 1);
}

module.exports = probit;

},{"./epsilon":9,"./inverse_error_function":15}],31:[function(require,module,exports){
'use strict';

var quantileSorted = require('./quantile_sorted');

/**
 * The [quantile](https://en.wikipedia.org/wiki/Quantile):
 * this is a population quantile, since we assume to know the entire
 * dataset in this library. Thus I'm trying to follow the
 * [Quantiles of a Population](http://en.wikipedia.org/wiki/Quantile#Quantiles_of_a_population)
 * algorithm from wikipedia.
 *
 * Sample is a one-dimensional array of numbers,
 * and p is either a decimal number from 0 to 1 or an array of decimal
 * numbers from 0 to 1.
 * In terms of a k/q quantile, p = k/q - it's just dealing with fractions or dealing
 * with decimal values.
 * When p is an array, the result of the function is also an array containing the appropriate
 * quantiles in input order
 *
 * @param {Array<number>} sample
 * @param {number} p
 * @returns {number} quantile
 */
function quantile(sample, p) {

    // We can't derive quantiles from an empty list
    if (sample.length === 0) { return null; }

    // Sort a copy of the array. We'll need a sorted array to index
    // the values in sorted order.
    var sorted = sample.slice().sort(function (a, b) { return a - b; });

    if (p.length) {
        // Initialize the result array
        var results = [];
        // For each requested quantile
        for (var i = 0; i < p.length; i++) {
            results[i] = quantileSorted(sorted, p[i]);
        }
        return results;
    } else {
        return quantileSorted(sorted, p);
    }
}

module.exports = quantile;

},{"./quantile_sorted":32}],32:[function(require,module,exports){
'use strict';

/**
 * This is the internal implementation of quantiles: when you know
 * that the order is sorted, you don't need to re-sort it, and the computations
 * are much faster.
 *
 * @param {Array<number>} sample input data
 * @param {number} p desired quantile: a number between 0 to 1, inclusive
 * @returns {number} quantile value
 */
function quantileSorted(sample, p) {
    var idx = (sample.length) * p;
    if (p < 0 || p > 1) {
        return null;
    } else if (p === 1) {
        // If p is 1, directly return the last element
        return sample[sample.length - 1];
    } else if (p === 0) {
        // If p is 0, directly return the first element
        return sample[0];
    } else if (idx % 1 !== 0) {
        // If p is not integer, return the next element in array
        return sample[Math.ceil(idx) - 1];
    } else if (sample.length % 2 === 0) {
        // If the list has even-length, we'll take the average of this number
        // and the next value, if there is one
        return (sample[idx - 1] + sample[idx]) / 2;
    } else {
        // Finally, in the simple case of an integer value
        // with an odd-length list, return the sample value at the index.
        return sample[idx];
    }
}

module.exports = quantileSorted;

},{}],33:[function(require,module,exports){
'use strict';

/**
 * The [R Squared](http://en.wikipedia.org/wiki/Coefficient_of_determination)
 * value of data compared with a function `f`
 * is the sum of the squared differences between the prediction
 * and the actual value.
 *
 * @param {Array<Array<number>>} data input data: this should be doubly-nested
 * @param {Function} f function called on `[i][0]` values within the dataset
 * @returns {number} r-squared value
 */
function rSquared(data, f) {
    if (data.length < 2) { return 1; }

    // Compute the average y value for the actual
    // data set in order to compute the
    // _total sum of squares_
    var sum = 0, average;
    for (var i = 0; i < data.length; i++) {
        sum += data[i][1];
    }
    average = sum / data.length;

    // Compute the total sum of squares - the
    // squared difference between each point
    // and the average of all points.
    var sumOfSquares = 0;
    for (var j = 0; j < data.length; j++) {
        sumOfSquares += Math.pow(average - data[j][1], 2);
    }

    // Finally estimate the error: the squared
    // difference between the estimate and the actual data
    // value at each point.
    var err = 0;
    for (var k = 0; k < data.length; k++) {
        err += Math.pow(data[k][1] - f(data[k][0]), 2);
    }

    // As the error grows larger, its ratio to the
    // sum of squares increases and the r squared
    // value grows lower.
    return 1 - (err / sumOfSquares);
}

module.exports = rSquared;

},{}],34:[function(require,module,exports){
'use strict';

/**
 * Root Mean Square (RMS)
 *
 * A mean function used as a measure of the magnitude of a set
 * of numbers, regardless of their sign.
 *
 * This is the square root of the mean of the squares of the
 * input numbers.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @returns {number} root mean square
 */
function rootMeanSquare(x) {
    if (x.length === 0) { return null; }

    var sumOfSquares = 0;
    for (var i = 0; i < x.length; i++) {
        sumOfSquares += Math.pow(x[i], 2);
    }

    return Math.sqrt(sumOfSquares / x.length);
}

module.exports = rootMeanSquare;

},{}],35:[function(require,module,exports){
'use strict';

var shuffle = require('./shuffle');

/**
 * Create a [simple random sample](http://en.wikipedia.org/wiki/Simple_random_sample)
 * from a given array of `n` elements.
 *
 * @param {Array} array input array. can contain any type
 * @param {number} n count of how many elements to take
 * @param {Function} [randomSource=Math.random] an optional source of entropy
 * instead of Math.random
 * @return {Array} subset of n elements in original array
 */
function sample(array, n, randomSource) {
    // shuffle the original array using a fisher-yates shuffle
    var shuffled = shuffle(array, randomSource);

    // and then return a subset of it - the first `n` elements.
    return shuffled.slice(0, n);
}

module.exports = sample;

},{"./shuffle":41}],36:[function(require,module,exports){
'use strict';

var sampleCovariance = require('./sample_covariance');
var sampleStandardDeviation = require('./sample_standard_deviation');

/**
 * The [correlation](http://en.wikipedia.org/wiki/Correlation_and_dependence) is
 * a measure of how correlated two datasets are, between -1 and 1
 *
 * @param {Array<number>} x first input
 * @param {Array<number>} y second input
 * @returns {number} sample correlation
 */
function sampleCorrelation(x, y) {
    var cov = sampleCovariance(x, y),
        xstd = sampleStandardDeviation(x),
        ystd = sampleStandardDeviation(y);

    if (cov === null || xstd === null || ystd === null) {
        return null;
    }

    return cov / xstd / ystd;
}

module.exports = sampleCorrelation;

},{"./sample_covariance":37,"./sample_standard_deviation":39}],37:[function(require,module,exports){
'use strict';

var mean = require('./mean');

/**
 * [sample covariance](https://en.wikipedia.org/wiki/Sample_mean_and_sampleCovariance) of two datasets:
 * how much do the two datasets move together?
 * x and y are two datasets, represented as arrays of numbers.
 *
 * @param {Array<number>} x first input
 * @param {Array<number>} y second input
 * @returns {number} sample covariance
 */
function sampleCovariance(x, y) {

    // The two datasets must have the same length which must be more than 1
    if (x.length <= 1 || x.length !== y.length) {
        return null;
    }

    // determine the mean of each dataset so that we can judge each
    // value of the dataset fairly as the difference from the mean. this
    // way, if one dataset is [1, 2, 3] and [2, 3, 4], their covariance
    // does not suffer because of the difference in absolute values
    var xmean = mean(x),
        ymean = mean(y),
        sum = 0;

    // for each pair of values, the covariance increases when their
    // difference from the mean is associated - if both are well above
    // or if both are well below
    // the mean, the covariance increases significantly.
    for (var i = 0; i < x.length; i++) {
        sum += (x[i] - xmean) * (y[i] - ymean);
    }

    // the covariance is weighted by the length of the datasets.
    return sum / (x.length - 1);
}

module.exports = sampleCovariance;

},{"./mean":23}],38:[function(require,module,exports){
'use strict';

var sumNthPowerDeviations = require('./sum_nth_power_deviations');
var sampleStandardDeviation = require('./sample_standard_deviation');

/**
 * [Skewness](http://en.wikipedia.org/wiki/Skewness) is
 * a measure of the extent to which a probability distribution of a
 * real-valued random variable "leans" to one side of the mean.
 * The skewness value can be positive or negative, or even undefined.
 *
 * Implementation is based on the adjusted Fisher-Pearson standardized
 * moment coefficient, which is the version found in Excel and several
 * statistical packages including Minitab, SAS and SPSS.
 *
 * Depends on `sumNthPowerDeviations()` and `sampleStandardDeviation`
 *
 * @param {Array<number>} x input
 * @returns {number} sample skewness
 */
function sampleSkewness(x) {
    // The skewness of less than three arguments is null
    if (x.length < 3) { return null; }

    var n = x.length,
        cubedS = Math.pow(sampleStandardDeviation(x), 3),
        sumCubedDeviations = sumNthPowerDeviations(x, 3);

    return n * sumCubedDeviations / ((n - 1) * (n - 2) * cubedS);
}

module.exports = sampleSkewness;

},{"./sample_standard_deviation":39,"./sum_nth_power_deviations":46}],39:[function(require,module,exports){
'use strict';

var sampleVariance = require('./sample_variance');

/**
 * The [standard deviation](http://en.wikipedia.org/wiki/Standard_deviation)
 * is the square root of the variance.
 *
 * depends on `sampleVariance()`
 *
 * @param {Array<number>} x input array
 * @returns {number} sample standard deviation
 */
function sampleStandardDeviation(x) {
    // The standard deviation of no numbers is null
    if (x.length <= 1) { return null; }

    return Math.sqrt(sampleVariance(x));
}

module.exports = sampleStandardDeviation;

},{"./sample_variance":40}],40:[function(require,module,exports){
'use strict';

var sumNthPowerDeviations = require('./sum_nth_power_deviations');

/*
 * The [variance](http://en.wikipedia.org/wiki/Variance)
 * is the sum of squared deviations from the mean.
 *
 * depends on `sumNthPowerDeviations`
 *
 * @param {Array<number>} x input array
 * @return {number} sample variance
 */
function sampleVariance(x) {
    // The variance of no numbers is null
    if (x.length <= 1) { return null; }

    var sumSquaredDeviationsValue = sumNthPowerDeviations(x, 2);

    // Find the mean value of that list
    return sumSquaredDeviationsValue / (x.length - 1);
}

module.exports = sampleVariance;

},{"./sum_nth_power_deviations":46}],41:[function(require,module,exports){
'use strict';

var shuffleInPlace = require('./shuffle_in_place');

/*
 * A [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
 * is a fast way to create a random permutation of a finite set.
 *
 * @param {Array} sample an array of any kind of element
 * @param {Function} [randomSource=Math.random] an optional entropy source
 * @return {Array} shuffled version of input
 */
function shuffle(sample, randomSource) {
    // slice the original array so that it is not modified
    sample = sample.slice();

    // and then shuffle that shallow-copied array, in place
    return shuffleInPlace(sample.slice(), randomSource);
}

module.exports = shuffle;

},{"./shuffle_in_place":42}],42:[function(require,module,exports){
'use strict';

/*
 * A [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
 * in-place - which means that it **will change the order of the original
 * array by reference**.
 *
 * @param {Array} sample input array
 * @param {Function} [randomSource=Math.random] an optional source of entropy
 * @returns {Array} sample
 */
function shuffleInPlace(sample, randomSource) {

    // a custom random number source can be provided if you want to use
    // a fixed seed or another random number generator, like
    // [random-js](https://www.npmjs.org/package/random-js)
    randomSource = randomSource || Math.random;

    // store the current length of the sample to determine
    // when no elements remain to shuffle.
    var length = sample.length;

    // temporary is used to hold an item when it is being
    // swapped between indices.
    var temporary;

    // The index to swap at each stage.
    var index;

    // While there are still items to shuffle
    while (length > 0) {
        // chose a random index within the subset of the array
        // that is not yet shuffled
        index = Math.floor(randomSource() * length--);

        // store the value that we'll move temporarily
        temporary = sample[length];

        // swap the value at `sample[length]` with `sample[index]`
        sample[length] = sample[index];
        sample[index] = temporary;
    }

    return sample;
}

module.exports = shuffleInPlace;

},{}],43:[function(require,module,exports){
'use strict';

var variance = require('./variance');

/**
 * The [standard deviation](http://en.wikipedia.org/wiki/Standard_deviation)
 * is the square root of the variance.
 *
 * @param {Array<number>} x input
 * @returns {number} standard deviation
 */
function standardDeviation(x) {
    // The standard deviation of no numbers is null
    if (x.length === 0) { return null; }

    return Math.sqrt(variance(x));
}

module.exports = standardDeviation;

},{"./variance":49}],44:[function(require,module,exports){
'use strict';

/**
 * A standard normal table, also called the unit normal table or Z table,
 * is a mathematical table for the values of Φ (phi), which are the values of
 * the cumulative distribution function of the normal distribution.
 * It is used to find the probability that a statistic is observed below,
 * above, or between values on the standard normal distribution, and by
 * extension, any normal distribution.
 *
 * The probabilities are taken from http://en.wikipedia.org/wiki/Standard_normal_table
 * The table used is the cumulative, and not cumulative from 0 to mean
 * (even though the latter has 5 digits precision, instead of 4).
 */
var standardNormalTable = [
    /*  z      0.00    0.01    0.02    0.03    0.04    0.05    0.06    0.07    0.08    0.09 */
    /* 0.0 */
    0.5000, 0.5040, 0.5080, 0.5120, 0.5160, 0.5199, 0.5239, 0.5279, 0.5319, 0.5359,
    /* 0.1 */
    0.5398, 0.5438, 0.5478, 0.5517, 0.5557, 0.5596, 0.5636, 0.5675, 0.5714, 0.5753,
    /* 0.2 */
    0.5793, 0.5832, 0.5871, 0.5910, 0.5948, 0.5987, 0.6026, 0.6064, 0.6103, 0.6141,
    /* 0.3 */
    0.6179, 0.6217, 0.6255, 0.6293, 0.6331, 0.6368, 0.6406, 0.6443, 0.6480, 0.6517,
    /* 0.4 */
    0.6554, 0.6591, 0.6628, 0.6664, 0.6700, 0.6736, 0.6772, 0.6808, 0.6844, 0.6879,
    /* 0.5 */
    0.6915, 0.6950, 0.6985, 0.7019, 0.7054, 0.7088, 0.7123, 0.7157, 0.7190, 0.7224,
    /* 0.6 */
    0.7257, 0.7291, 0.7324, 0.7357, 0.7389, 0.7422, 0.7454, 0.7486, 0.7517, 0.7549,
    /* 0.7 */
    0.7580, 0.7611, 0.7642, 0.7673, 0.7704, 0.7734, 0.7764, 0.7794, 0.7823, 0.7852,
    /* 0.8 */
    0.7881, 0.7910, 0.7939, 0.7967, 0.7995, 0.8023, 0.8051, 0.8078, 0.8106, 0.8133,
    /* 0.9 */
    0.8159, 0.8186, 0.8212, 0.8238, 0.8264, 0.8289, 0.8315, 0.8340, 0.8365, 0.8389,
    /* 1.0 */
    0.8413, 0.8438, 0.8461, 0.8485, 0.8508, 0.8531, 0.8554, 0.8577, 0.8599, 0.8621,
    /* 1.1 */
    0.8643, 0.8665, 0.8686, 0.8708, 0.8729, 0.8749, 0.8770, 0.8790, 0.8810, 0.8830,
    /* 1.2 */
    0.8849, 0.8869, 0.8888, 0.8907, 0.8925, 0.8944, 0.8962, 0.8980, 0.8997, 0.9015,
    /* 1.3 */
    0.9032, 0.9049, 0.9066, 0.9082, 0.9099, 0.9115, 0.9131, 0.9147, 0.9162, 0.9177,
    /* 1.4 */
    0.9192, 0.9207, 0.9222, 0.9236, 0.9251, 0.9265, 0.9279, 0.9292, 0.9306, 0.9319,
    /* 1.5 */
    0.9332, 0.9345, 0.9357, 0.9370, 0.9382, 0.9394, 0.9406, 0.9418, 0.9429, 0.9441,
    /* 1.6 */
    0.9452, 0.9463, 0.9474, 0.9484, 0.9495, 0.9505, 0.9515, 0.9525, 0.9535, 0.9545,
    /* 1.7 */
    0.9554, 0.9564, 0.9573, 0.9582, 0.9591, 0.9599, 0.9608, 0.9616, 0.9625, 0.9633,
    /* 1.8 */
    0.9641, 0.9649, 0.9656, 0.9664, 0.9671, 0.9678, 0.9686, 0.9693, 0.9699, 0.9706,
    /* 1.9 */
    0.9713, 0.9719, 0.9726, 0.9732, 0.9738, 0.9744, 0.9750, 0.9756, 0.9761, 0.9767,
    /* 2.0 */
    0.9772, 0.9778, 0.9783, 0.9788, 0.9793, 0.9798, 0.9803, 0.9808, 0.9812, 0.9817,
    /* 2.1 */
    0.9821, 0.9826, 0.9830, 0.9834, 0.9838, 0.9842, 0.9846, 0.9850, 0.9854, 0.9857,
    /* 2.2 */
    0.9861, 0.9864, 0.9868, 0.9871, 0.9875, 0.9878, 0.9881, 0.9884, 0.9887, 0.9890,
    /* 2.3 */
    0.9893, 0.9896, 0.9898, 0.9901, 0.9904, 0.9906, 0.9909, 0.9911, 0.9913, 0.9916,
    /* 2.4 */
    0.9918, 0.9920, 0.9922, 0.9925, 0.9927, 0.9929, 0.9931, 0.9932, 0.9934, 0.9936,
    /* 2.5 */
    0.9938, 0.9940, 0.9941, 0.9943, 0.9945, 0.9946, 0.9948, 0.9949, 0.9951, 0.9952,
    /* 2.6 */
    0.9953, 0.9955, 0.9956, 0.9957, 0.9959, 0.9960, 0.9961, 0.9962, 0.9963, 0.9964,
    /* 2.7 */
    0.9965, 0.9966, 0.9967, 0.9968, 0.9969, 0.9970, 0.9971, 0.9972, 0.9973, 0.9974,
    /* 2.8 */
    0.9974, 0.9975, 0.9976, 0.9977, 0.9977, 0.9978, 0.9979, 0.9979, 0.9980, 0.9981,
    /* 2.9 */
    0.9981, 0.9982, 0.9982, 0.9983, 0.9984, 0.9984, 0.9985, 0.9985, 0.9986, 0.9986,
    /* 3.0 */
    0.9987, 0.9987, 0.9987, 0.9988, 0.9988, 0.9989, 0.9989, 0.9989, 0.9990, 0.9990
];

module.exports = standardNormalTable;

},{}],45:[function(require,module,exports){
'use strict';

/**
 * The sum of an array is the result of adding all numbers
 * together, starting from zero.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @return {number} sum of all input numbers
 * @example
 * console.log(sum([1, 2, 3])); // 6
 */
function sum(x) {
    var value = 0;
    for (var i = 0; i < x.length; i++) {
        value += x[i];
    }
    return value;
}

module.exports = sum;

},{}],46:[function(require,module,exports){
'use strict';

var mean = require('./mean');

/**
 * The sum of deviations to the Nth power.
 * When n=2 it's the sum of squared deviations.
 * When n=3 it's the sum of cubed deviations.
 *
 * @param {Array<number>} input
 * @param {number} n power
 * @returns {number} sum of nth power deviations
 */
function sumNthPowerDeviations(x, n) {
    var meanValue = mean(x),
        sum = 0;

    for (var i = 0; i < x.length; i++) {
        sum += Math.pow(x[i] - meanValue, n);
    }

    return sum;
}

module.exports = sumNthPowerDeviations;

},{"./mean":23}],47:[function(require,module,exports){
'use strict';

var standardDeviation = require('./standard_deviation');
var mean = require('./mean');

/**
 * This is to compute a one-sample t-test, comparing the mean
 * of a sample to a known value, x.
 *
 * in this case, we're trying to determine whether the
 * population mean is equal to the value that we know, which is `x`
 * here. usually the results here are used to look up a
 * [p-value](http://en.wikipedia.org/wiki/P-value), which, for
 * a certain level of significance, will let you determine that the
 * null hypothesis can or cannot be rejected.
 *
 * @param {Array<number>} sample
 * @returns {number} value
 */
function tTest(sample, x) {
    // The mean of the sample
    var sampleMean = mean(sample);

    // The standard deviation of the sample
    var sd = standardDeviation(sample);

    // Square root the length of the sample
    var rootN = Math.sqrt(sample.length);

    // Compute the known value against the sample,
    // returning the t value
    return (sampleMean - x) / (sd / rootN);
}

module.exports = tTest;

},{"./mean":23,"./standard_deviation":43}],48:[function(require,module,exports){
'use strict';

var mean = require('./mean');
var sampleVariance = require('./sample_variance');

/**
 * This is to compute [two sample t-test](http://en.wikipedia.org/wiki/Student's_t-test).
 * Tests whether "mean(X)-mean(Y) = difference", (
 * in the most common case, we often have `difference == 0` to test if two samples
 * are likely to be taken from populations with the same mean value) with
 * no prior knowledge on standard deviations of both samples
 * other than the fact that they have the same standard deviation.
 *
 * Usually the results here are used to look up a
 * [p-value](http://en.wikipedia.org/wiki/P-value), which, for
 * a certain level of significance, will let you determine that the
 * null hypothesis can or cannot be rejected.
 *
 * `diff` can be omitted if it equals 0.
 *
 * [This is used to confirm or deny](http://www.monarchlab.org/Lab/Research/Stats/2SampleT.aspx)
 * a null hypothesis that the two populations that have been sampled into
 * `sampleX` and `sampleY` are equal to each other.
 *
 * Depends on `sampleVariance()` and `mean()`
 */
function tTestTwoSample(sampleX, sampleY, difference) {
    var n = sampleX.length,
        m = sampleY.length;

    // If either sample doesn't actually have any values, we can't
    // compute this at all, so we return `null`.
    if (!n || !m) { return null; }

    // default difference (mu) is zero
    if (!difference) {
        difference = 0;
    }

    var meanX = mean(sampleX),
        meanY = mean(sampleY);

    var weightedVariance = ((n - 1) * sampleVariance(sampleX) +
        (m - 1) * sampleVariance(sampleY)) / (n + m - 2);

    return (meanX - meanY - difference) /
        Math.sqrt(weightedVariance * (1 / n + 1 / m));
}

module.exports = tTestTwoSample;

},{"./mean":23,"./sample_variance":40}],49:[function(require,module,exports){
'use strict';

var mean = require('./mean');

/**
 * The [variance](http://en.wikipedia.org/wiki/Variance)
 * is the sum of squared deviations from the mean.
 *
 * depends on `mean()`
 *
 * @param {Array<number>} input
 * @returns {number} variance
 */
function variance(x) {
    // The variance of no numbers is null
    if (x.length === 0) { return null; }

    var meanValue = mean(x),
        deviations = [];

    // Make a list of squared deviations from the mean.
    for (var i = 0; i < x.length; i++) {
        deviations.push(Math.pow(x[i] - meanValue, 2));
    }

    // Find the mean value of that list
    return mean(deviations);
}

module.exports = variance;

},{"./mean":23}],50:[function(require,module,exports){
'use strict';

/**
 * The [Z-Score, or Standard Score](http://en.wikipedia.org/wiki/Standard_score).
 *
 * The standard score is the number of standard deviations an observation
 * or datum is above or below the mean. Thus, a positive standard score
 * represents a datum above the mean, while a negative standard score
 * represents a datum below the mean. It is a dimensionless quantity
 * obtained by subtracting the population mean from an individual raw
 * score and then dividing the difference by the population standard
 * deviation.
 *
 * The z-score is only defined if one knows the population parameters;
 * if one only has a sample set, then the analogous computation with
 * sample mean and sample standard deviation yields the
 * Student's t-statistic.
 *
 * @param {number} x
 * @param {number} mean
 * @param {number} standardDeviation
 * @return {number} z score
 */
function zScore(x, mean, standardDeviation) {
    return (x - mean) / standardDeviation;
}

module.exports = zScore;

},{}]},{},[1])(1)
});