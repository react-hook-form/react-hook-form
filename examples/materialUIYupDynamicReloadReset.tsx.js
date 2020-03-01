/*
This example uses contolled componets, with yup valiation
and can handle changes to the incoming prop. In this case
the prop that is updated is called "accountvalues".  This
form can be used for add/edit via the "actionstate" prop.
This works with Material-UI components and hooks.
*/

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Grid,
  Button,
  TextField
} from "@material-ui/core";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: 4
  },
  card: {
    display: "flex",
    flexDirection: "column",
    padding: 4
  }
}));

const Form = props => {
  const { className, staticContext, ...rest } = props;
  let { accountvalues, cardtitle, actionstate } = props;
  const classes = useStyles();

  const [saveDisabled, setSaveDisabled] = useState(true);

  /*
  I had to write a custom reset for the form because the
  react-hook-form reset wouldn't work as it's getting confused
  with the dynamic key setting below.
  */
  const resetForm = () => {
    Object.keys(accountvalues).forEach(key => {
      setValue(key, accountvalues[key]);
    });
    setSaveDisabled(true);
  };

  useEffect(() => {
    setSaveDisabled(true);
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountvalues]);

  // yup validation
  const formSchema = yup.object().shape({
    first_name: yup.string().required("First Name is required"),
    balance: yup
      .number()
      .transform(value => (isNaN(value) ? undefined : value))
      .required("Balance is a required number")
      .min(0, "Balance should be greather than or equal to 0")
  });

  const { control, errors, handleSubmit, setValue } = useForm({
    defaultValues: accountvalues,
    validationSchema: formSchema
  });

  const formSubmit = async data => {
    console.log(JSON.stringify(data));
    if (actionstate === "add") {
      console.log("add");
    } else {
      console.log("edit");
    }
  };

  const handleOnKeyUp = event => {
    setSaveDisabled(false);
  };

  /*
  this is the ID that denotes a unique new accountvalues
  key prop below.
  */
  formId = accountvalues.account_id;

  /*
  Note dynamic key value in the Controller object below!
  This is what forces the update on the accountvalues
  data prop change.
  */
  return (
    <div className={classes.root}>
      <Grid container spacing={4}>
        <Grid item lg={6} md={8} xl={6} xs={12}>
          <Card {...rest} className={clsx(classes.card, className)}>
            <form
              autoComplete="off"
              noValidate
              onSubmit={handleSubmit(formSubmit)}
            >
              <CardHeader title={cardtitle} />
              <Divider />
              <CardContent>
                <Grid container direction="column" spacing={2}>
                  <Grid item md={6} xs={12}>
                    <Controller
                      as={
                        <TextField
                          fullWidth
                          label="First Name"
                          margin="dense"
                          required
                          variant="outlined"
                          helperText={
                            errors.first_name ? errors.first_name.message : null
                          }
                          error={errors.first_name ? true : false}
                        />
                      }
                      control={control}
                      name="first_name"
                      defaultValue={accountvalues.portfolio_name}
                      onKeyUp={handleOnKeyUp}
                      key={"first_name-" + formId}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <Controller
                      as={
                        <TextField
                          fullWidth
                          label="Account Balance"
                          margin="dense"
                          name="balance"
                          required
                          variant="outlined"
                          helperText={
                            errors.balance
                              ? errors.balance.message
                              : "The balance in the account"
                          }
                          error={errors.balance ? true : false}
                        />
                      }
                      control={control}
                      name="balance"
                      defaultValue={accountvalues.balance}
                      onKeyUp={handleOnKeyUp}
                      key={"balance-" + formId}
                    />
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={saveDisabled}
                >
                  Save
                </Button>
                <Button color="primary" variant="contained" onClick={resetForm}>
                  Reset
                </Button>
              </CardActions>
            </form>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

Form.propTypes = {
  className: PropTypes.string,
  accountvalues: PropTypes.object,
  cardtitle: PropTypes.string,
  actionstate: PropTypes.string
};

const App = props => {
  return (
    <Form
      accountvalues={{
        account_id: 1234,
        first_name: "Test Name",
        balance: 4567.0
      }}
      cardtitle="Account"
      actionstate="edit"
    />
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
