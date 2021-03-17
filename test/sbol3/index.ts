
import create_component from './create-component'
import create_interaction from './create-interaction'
import sbol2_to_sbol3 from './sbol2-to-sbol3'
import sbol3_to_sbol2 from './sbol3-to-sbol2'

export default [
    // ...create_component,
    // ...create_interaction
    //...sbol2_to_sbol3
    ...sbol3_to_sbol2
]

