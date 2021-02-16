// when the document has fully loaded: 
$(document).ready(function(){
    
    $(".edit_team").hide();

    const selected_drivers = new Set();
    var selected_team = "";
    var total_cost = 0;

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
        let is_driver = $(this).hasClass('edit_driver');
        let this_id = $(this).attr('id');
        let this_cost = $(this).children("div").children("p")[2];
        this_cost = $(this_cost).text();

        // if a sixth driver is clicked upon or a second team, do nothing
        if (is_driver && !selected_drivers.has(this_id) && selected_drivers.size >= 5
            || !is_driver && selected_team !== "" && this_id !== selected_team)
            return;
            
        // update drivers list and total cost
        if (is_driver && selected_drivers.has(this_id)){
            selected_drivers.delete(this_id);
            calculateCost(this_cost *= -1)
        } else if (is_driver) {
            selected_drivers.add(this_id);
            calculateCost(this_cost)
        } else if (selected_team === this_id) {
            selected_team = "";
            calculateCost(this_cost *= -1)
        } else if (selected_team === ""){
            selected_team = this_id;
            calculateCost(this_cost)
        }
        // TODO if another constructor is selected whilst one is already set, the calculatecost function would not work, UPDATE
        
        console.log(selected_drivers, selected_team);

        // toggle css class to visually represent
        $(this).toggleClass('bg-info');
    });

    $("#save-btn").on("click", function(){
        // post to url if the total cost is lower than 100
        if (total_cost <= 100){
            $.post("/save_roster", 
                {
                    'drivers': JSON.stringify(Array.from(selected_drivers)),
                    'team' : JSON.stringify(selected_team),
                    'roster' : 1
                }, 
                function(_, status){
                    if (status === "success"){
                        $('#msg').html('<span style="color: green;">Saved sucessfully.</span>');
                    }
                });
        }
    });

    //update the total cost bar
    function calculateCost (change) {
        total_cost = +((total_cost + parseFloat(change)).toFixed(1)); // toFixed shortens the decimals

        $("#progress-bar").attr("aria-valuenow", Math.round(total_cost)).attr("style", `width: ${Math.round(total_cost)}%`).text(total_cost);

        // visual indication
        if (total_cost > 100) {
            $("#progress-bar").addClass("bg-danger");
            $("#save-btn").addClass("btn-danger").removeClass("btn-primary");
        } else {
            $("#progress-bar").removeClass("bg-danger");
            $("#save-btn").addClass("btn-primary").removeClass("btn-danger");
        }
    }
    
});