"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function visitorIdentity(identityType) {
    return (target, name, descriptor) => {
        const oldValue = descriptor.value;
        descriptor.value = function (ctx) {
            if (ctx.validateVisitorIdentity) {
                ctx.validateVisitorIdentity(identityType);
            }
            return oldValue.apply(this, arguments);
        };
        return descriptor;
    };
}
exports.visitorIdentity = visitorIdentity;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlzdG9ySWRlbnRpdHlEZWNvcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXh0ZW5kL3Zpc3RvcklkZW50aXR5RGVjb3JhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsU0FBZ0IsZUFBZSxDQUFDLFlBQVk7SUFDeEMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUU7UUFDaEMsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUNsQyxVQUFVLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBUTtZQUNqQyxJQUFJLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRTtnQkFDN0IsR0FBRyxDQUFDLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQzdDO1lBQ0QsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUM7UUFDRixPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDLENBQUM7QUFDTixDQUFDO0FBWEQsMENBV0MifQ==