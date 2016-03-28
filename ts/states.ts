/// <reference path="services.ts" />
/// <reference path="util.ts" />

class StateService implements Service {
    private states: StringMap<State> = {};
    private stateTypes: Array<StateType>;
    private startingState: StateType;
    private currentState: State;

    constructor(args: any) {
        let {stateTypes, startingState} = args;
        ASSERT_ARRAY(stateTypes);
        this.stateTypes = stateTypes;
        ASSERT_DEFINED(startingState);
        this.startingState = startingState;
    }

    init(services: ServiceContainer) {
        for (let stateType of this.stateTypes) {
            if (this.states[stateType.name] != null) {
                throw new Error("Duplicate state with same name.");
            }
            let state = new stateType(services);
            this.states[stateType.name] = state;
        }
        this.switchTo(this.startingState);
    }

    switchTo(stateType: StateType) {
        let name = stateType.name;
        let newState = this.states[name];
        if (newState == null) {
            throw new Error(`State ${name} not found.`);
        }
        if (this.currentState != null) {
            this.currentState.onExit();
        }
        this.currentState = newState;
        newState.onEnter();
    }
}

interface StateType {
    new(services: ServiceContainer): State;
    name: string;
}

interface State {
    onEnter(): void;

    onExit(): void;
}
