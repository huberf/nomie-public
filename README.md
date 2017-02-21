# Nomie Cloud App for Public Sharing
Share data from any Nomie tracker at an anonymous public URL

To setup add
[https://nomie.noahcodes.com/join](https://nomie.noahcodes.com/join) to Nomie as
a 3rd party Cloud App. Every time you run the cloud app it will display your
public link which you can click, and then share with whomeever you want. Keep in
mind the URL, although unique to you is not fully private, so be considerate of
what you add as the tracker name.

## Local Setup:
* `git clone https://github.com/huberf/nomie-public`
* `cd nomie-public`
* `npm install`
* `npm start`

## Heroku Setup:
* `git clone https://github.com/huberf/nomie-public`
* `cd nomie-public`
* `heroku create`
* `git push heroku master`
* `heroku open`

## Instruction Manual
* Visit [nomie.noahcodes.com](https://nomie.noahcodes.com) in your phone's
  webbrowser and press the add to Nomie button. Choose a tracker and title for
  your page in the setup.
* Run the app to see your ID and public URL. Click on the URL to view it in your
  web browser and easily share it.
* To use the JSON api, simply load `https://nomie.noahcodes.com/api/:userId`
  replacing `:userID` with your personal ID.
* Cheers!

## How It Works
* The Nomie app sounds the cloud service a month worth of tracking data (to the
  `/collect` endpoint). The service then loads the current day and month in a
  string of the fashion `DD MM`. It does the same for the previous day. It then
  calculates this value for each data item and compares the strings. If it is
  equal to the current day's string, it is added to the `todayCount` and the
  same is used to calculate for the `yesterdayCount` variable. This data is then
  stored in a MongoDB record. The in-app data screen is then sent using the
  variables that stored this computed data as the source.

If you want to have a fully private instance of this, please follow the above
steps. Nomie is centered around privacy, so creating your own personal instance
will give you the ability to easily selectively share your data without the
middle man of my personal instance.

If you have ideas or want to contribute please open an issue or a PR.
