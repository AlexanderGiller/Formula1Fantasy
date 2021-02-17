// when the document has fully loaded: 
const selected_units = {drivers: [], team: {id: "", cost: 0.0}};
var roster_id = "";
var total_cost = 0.0;
const max_cost = 100;

$(document).ready(function(){
    
    roster_id = $("#roster_selector").val();
    
    $(".edit_team").hide();
    
    //when the driver button is clicked
    $("#btn-drivers").on("click", function(){
        $(".edit_driver").show();
        $(".edit_team").hide();
        $(this).addClass("btn-primary").removeClass("btn-secondary");
        $("#btn-teams").addClass("btn-secondary").removeClass("btn-primary");
    });
    $("#btn-teams").on("click", function(){
        $(".edit_team").show();
        $(".edit_driver").hide();
        $(this).addClass("btn-primary").removeClass("btn-secondary");
        $("#btn-drivers").addClass("btn-secondary").removeClass("btn-primary");
    });



    // when a card is clicked
    $(".card").on("click", function(){
        const is_driver = $(this).hasClass('edit_driver');
        const this_id = $(this).attr('id').split('_')[1];
        const this_cost = $(this).find('.price').text();
        var is_new = true;

        // check if the clicked card is already selected
        for (let i = 0; i < selected_units.drivers.length; i++){
            if (selected_units.drivers[i].id === this_id) {
                is_new = false; 
                break;
            }
        }

        // if a sixth driver is clicked upon, do nothing
        if (is_driver && selected_units.drivers.length >= 5 && is_new)
            return;
            
        // update units dict and total cost
        if (is_driver){
            filterArray(selected_units.drivers, {id: this_id, cost: this_cost}, "id")
        }
        else if (selected_units.team.id === this_id) {
            selected_units.team = {id: "", cost: 0.0}
        } else {
            if (selected_units.team.id !== ""){
                $(`#team_${selected_units.team.id}`).toggleClass('bg-info').find('.checkmark-img').toggle();
                $(`#team_${selected_units.team.id}`).find('.img-thumbnail').toggleClass('img-darken');
            }
            selected_units.team = {id: this_id, cost: this_cost}
        }
        
        console.log(selected_units);

        calculateCost();

        // toggle css class to visually represent
        $(this).toggleClass('bg-info');
        $(this).find('.checkmark-img').toggle();
        $(this).find('.img-thumbnail').toggleClass('img-darken');
    });
    // Save the selections
    $("#save-btn").on("click", function(){
        let driver_ids = selected_units.drivers.map(function(e) {
            return e.id;
        });

        // post to url if the total cost is lower than 100
        if (total_cost <= max_cost){
            $.post("/save_roster", 
                {
                    'drivers': JSON.stringify(driver_ids),
                    'team' : JSON.stringify(selected_units.team.id),
                    'roster' : JSON.stringify(roster_id)
                }, 
                function(_, status){
                    if (status === "success"){
                        $("#msg_success").show(200).delay(5000).fadeOut();
                    } else {
                        $("#msg_error").show(200).delay(5000).fadeOut();                        
                    }
                });
        }
    });
    $("#clear-btn").on("click", function(){
        for (driver of selected_units.drivers) {
            $(`#driver_${driver.id}`).toggleClass('bg-info').find('.checkmark-img').toggle();
            $(`#driver_${driver.id}`).find('.img-thumbnail').toggleClass('img-darken');
        }

        $(`#team_${selected_units.team.id}`).toggleClass('bg-info').find('.checkmark-img').toggle();
        $(`#team_${selected_units.team.id}`).find('.img-thumbnail').toggleClass('img-darken');

        selected_units.drivers = [];
        selected_units.team = {id: "", cost: 0.0};
        calculateCost();
    });
    
});

//update the total cost bar
function calculateCost () {
    total_cost = 0.0;

    for (driver of selected_units.drivers){
        total_cost = +(total_cost + parseFloat(driver.cost)).toFixed(1);
    }
    total_cost = +(total_cost + parseFloat(selected_units.team.cost)).toFixed(1);

    $("#progress-bar").attr("aria-valuenow", Math.round(total_cost)).attr("style", `width: ${Math.round(total_cost)}%`).text(total_cost);

    // visual indication
    if (total_cost > max_cost) {
        $("#progress-bar").addClass("bg-danger");
        $("#save-btn").addClass("btn-danger").removeClass("btn-primary");
    } else {
        $("#progress-bar").removeClass("bg-danger");
        $("#save-btn").addClass("btn-primary").removeClass("btn-danger");
    }
}

// add an item to array if it doesnt exist, else delete it
function filterArray(array, object, key) {
    let index = array.findIndex(o => o[key] === object[key]);
    if (index === -1) array.push(object);
    else array.splice(index, 1);
    return array;
}