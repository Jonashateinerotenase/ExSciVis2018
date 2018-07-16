#version 150
//#extension GL_ARB_shading_language_420pack : require
#extension GL_ARB_explicit_attrib_location : require

#define TASK 10
#define ENABLE_OPACITY_CORRECTION 0
#define ENABLE_LIGHTNING 0
#define ENABLE_SHADOWING 0

in vec3 ray_entry_position;

layout(location = 0) out vec4 FragColor;

uniform mat4 Modelview;

uniform sampler3D volume_texture;
uniform sampler2D transfer_texture;


uniform vec3    camera_location;
uniform float   sampling_distance;
uniform float   sampling_distance_ref;
uniform float   iso_value;
uniform vec3    max_bounds;
uniform ivec3   volume_dimensions;

uniform vec3    light_position;
uniform vec3    light_ambient_color;
uniform vec3    light_diffuse_color;
uniform vec3    light_specular_color;
uniform float   light_ref_coef;

bool
inside_volume_bounds(const in vec3 sampling_position)
{
    return (   all(greaterThanEqual(sampling_position, vec3(0.0)))
            && all(lessThanEqual(sampling_position, max_bounds)));
}


float
get_sample_data(vec3 in_sampling_pos)
{
    vec3 obj_to_tex = vec3(1.0) / max_bounds;
    return texture(volume_texture, in_sampling_pos * obj_to_tex).r;

}

vec3 get_gradient(vec3 in_sampling_pos)
{
    float h_x = max_bounds.x / volume_dimensions.x;
    float h_y = max_bounds.y / volume_dimensions.y;
    float h_z = max_bounds.z / volume_dimensions.z;

    //delta_x = Sampling_Position(x+l,y,z) - Sampling_Position(x-l,y,z)
    float delta_x = (get_sample_data(vec3(in_sampling_pos.x + h_x, in_sampling_pos.y, in_sampling_pos.z)) - get_sample_data(vec3(in_sampling_pos.x - h_x, in_sampling_pos.y, in_sampling_pos.z)))/2;
    float delta_y = (get_sample_data(vec3(in_sampling_pos.x, in_sampling_pos.y + h_y, in_sampling_pos.z)) - get_sample_data(vec3(in_sampling_pos.x, in_sampling_pos.y - h_y, in_sampling_pos.z)))/2;
    float delta_z = (get_sample_data(vec3(in_sampling_pos.x, in_sampling_pos.y, in_sampling_pos.z + h_z)) - get_sample_data(vec3(in_sampling_pos.x, in_sampling_pos.y, in_sampling_pos.z - h_z)))/2;

    return vec3(delta_x, delta_y, delta_z);
}

vec3 phong(vec3 in_sampling_position)
{
    vec3 phong_output = vec3(0);
    vec3 normal = vec3(normalize(get_gradient(in_sampling_position))) * -1;
    vec3 light_direction = vec3(normalize(light_position - in_sampling_position));
    vec3 ref_dir = reflect(-light_direction, normal);

    vec3 view_dir = normalize(light_direction + normal);

    float phong_diffuse;
    float spec_k = 0.0;
    float speck_engel = max(dot(view_dir,normal), 0.0);
    //speckular, es heißt speckular!!!
    float baby_sheepertian = max(dot(normal,light_direction),0.0);
    if (baby_sheepertian > 0.0)
    {
        speck_engel = max(dot(ref_dir, view_dir),0.0);
        spec_k = pow(speck_engel,16.0);//light_ref_coef);
    }
    phong_output = light_ambient_color + baby_sheepertian * light_diffuse_color + spec_k * light_specular_color;

 return phong_output;
}

void main()
{
    /// One step trough the volume
    vec3 ray_increment      = normalize(ray_entry_position - camera_location) * sampling_distance;
    /// Position in Volume
    vec3 sampling_pos       = ray_entry_position + ray_increment; // test, increment just to be sure we are in the volume

    /// Init color of fragment
    vec4 dst = vec4(0.0, 0.0, 0.0, 0.0);

    /// check if we are inside volume
    bool inside_volume = inside_volume_bounds(sampling_pos);
    
    if (!inside_volume)
        discard;

#if TASK == 10
    vec4 max_val = vec4(0.0, 0.0, 0.0, 0.0);    
    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added

    while (inside_volume) 
    {      
        // get sample
        float s = get_sample_data(sampling_pos);
                
        // apply the transfer functions to retrieve color and opacity
        vec4 color = texture(transfer_texture, vec2(s, s));
           
        // this is the example for maximum intensity projection
        max_val.r = max(color.r, max_val.r);
        max_val.g = max(color.g, max_val.g);
        max_val.b = max(color.b, max_val.b);
        max_val.a = max(color.a, max_val.a);
        
        // increment the ray sampling position
        sampling_pos  += ray_increment;

        // update the loop termination condition
        inside_volume  = inside_volume_bounds(sampling_pos);
    }

    dst = max_val;
#endif 
    
#if TASK == 11
    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added

    //Assignment 1.1
    vec4 average = vec4(0.0, 0.0, 0.0, 0.0);
    float incr = 0;

    while (inside_volume)
    {      
        // get sample
        float s = get_sample_data(sampling_pos);
        // dummy code
        //dst = vec4(sampling_pos, 1.0);

        // apply the transfer functions to retrieve color and opacity
        vec4 color = texture(transfer_texture, vec2(s, s));

        //adding up every color value to get the average
        average.r += color.r;
        average.g += color.g;
        average.b += color.b;
        average.a += color.a;
        
        // increment the ray sampling position
        sampling_pos  += ray_increment;

        // update the loop termination condition
        inside_volume  = inside_volume_bounds(sampling_pos);

        incr = incr + 1.0;
    }

    dst = 3*average/incr;

#endif
    
#if TASK == 12 || TASK == 13
    //Assignment 1.2 Isosurface

    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added
    while (inside_volume)
    {
        // get sample
        float s = get_sample_data(sampling_pos);

        // dummy code
        //dst = vec4(light_diffuse_color, 1.0);
        
        //iso_value from uniform upload
        if(iso_value < s && TASK != 13)
        {
            dst = vec4(0.2,0.2,0.2,1.0);
        }
        // increment the ray sampling position

        vec3 prev = sampling_pos; //Vorhergehende sample position - vor dem Increment

        sampling_pos += ray_increment;

#if TASK == 13 // Binary Search
        /*
            Er unterschied ist im sliding
        */


        //Zuerst: wir bekommen die daten aus 2 hintereinander "abgetasteten" werten
        float s_out = get_sample_data(prev);
        float s_in  = get_sample_data(sampling_pos);

        //zwischen diesen Werteb auf dem Ray ist die Intersection mit der angegebenen sample value
        if (s_out <= iso_value && s_in >= iso_value) 
        {
            //die tatsächlichen orte
            vec3 in_place  = sampling_pos;//zu weit hinten
            vec3 out_place = prev;        //zu weit vorne

            //diese Werte wird zwischen den beiden sein
            vec3 newbound;

            const int fineness = 100;//Anzahl der Intervalhalbierungen


            //Der tatsächliche binary - search - Algorithmus:
            for (int i = 0; i < fineness; ++i)
            {
                //newbound = out_place + ((in_place - out_place) / 2); //Mitte zwischen in und out
                newbound = (out_place + in_place) / 2;
                float s_new = get_sample_data(newbound);//Die neue, hoffentlich näher dranne dichte

                const float bias = 0.001;//Da man floats schwer vergleichen kann

                if(s_new == iso_value /*Exakt den wert erreicht*/
                || abs(s_new - iso_value) < bias /*Extrem nah am wert*/)
                {
                    dst = vec4(0.2,0.2,0.2,1.0);
                    i = fineness;
                    if (ENABLE_LIGHTNING == 1 )dst = vec4(phong(newbound),1.0);
                }
                else if (s_new < iso_value)
                {
                    out_place = newbound; // interval mehr nach innen 
                }
                else
                {
                    in_place = newbound; // interval mehr nach aussen
                }


            }
            break;
        }

        
#endif
#if ENABLE_LIGHTNING == 1 // Add Shading
        if(iso_value < s)
        {
            //vec3 normal = vec3(normalize(get_gradient(sampling_pos))) * -1;
           //dst = vec4(normal,1.0);
            if(TASK != 13)dst = vec4(phong(sampling_pos),1.0);
            break;
        }

#if ENABLE_SHADOWING == 1 // Add Shadows
        
        vec3 shadow_sampling_pos = sampling_pos;
        vec3 light_direction = vec3(normalize(light_position - sampling_pos));
        vec3 light_impact = sampling_distance * light_direction;

        while(inside_volume)
        {
            shadow_sampling_pos = shadow_sampling_pos + light_impact;
            float in_shadow = get_sample_data(shadow_sampling_pos) - iso_value;

            if(in_shadow > 0)
            {
                dst = vec4(0.0,0.0,0.0,1);
                break;
            }

            inside_volume = inside_volume_bounds(shadow_sampling_pos);
        }
        
#endif
#endif

        // update the loop termination condition
        inside_volume = inside_volume_bounds(sampling_pos);
    }
#endif 

#if TASK == 31
    // the traversal loop,
    // termination when the sampling position is outside volume boundarys
    // another termination condition for early ray termination is added
    while (inside_volume)
    {
        // get sample
#if ENABLE_OPACITY_CORRECTION == 1 // Opacity Correction
        IMPLEMENT;
#else
        float s = get_sample_data(sampling_pos);
#endif
        // dummy code
        dst = vec4(light_specular_color, 1.0);

        // increment the ray sampling position
        sampling_pos += ray_increment;

#if ENABLE_LIGHTNING == 1 // Add Shading
        IMPLEMENT;
#endif

        // update the loop termination condition
        inside_volume = inside_volume_bounds(sampling_pos);
    }
#endif 

    // return the calculated color value
    FragColor = dst;
}

