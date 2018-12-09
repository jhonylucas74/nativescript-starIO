var StarIO = require("nativescript-starIO").StarIO;
var starIO = new StarIO();

describe("greet function", function() {
    it("exists", function() {
        expect(starIO.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(starIO.greet()).toEqual("Hello, NS");
    });
});