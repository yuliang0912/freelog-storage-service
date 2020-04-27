module.exports.visitorIdentity = function (identityType) {
    return function (target, name, descriptor) {
        var oldValue = descriptor.value;
        descriptor.value = function (ctx) {
            ctx.validateVisitorIdentity && ctx.validateVisitorIdentity(identityType);
            return oldValue.apply(this, arguments);
        };
        return descriptor;
    };
}

