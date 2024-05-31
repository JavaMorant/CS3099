import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {
  FormControl,
  FormHelperText,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import { usePostStadiums } from '../../api/hooks/stadium.hook';
import { StadiumFormData } from '../../api/services/stadiums';
import { HTTPError } from 'ky';

interface FormEntryProps {
  title: string;
  name: string;
  half?: boolean;
  number?: boolean;
  helperText?: string;
}

interface StadiumFormProps {
  optionsLeague: {
    label: string;
    value: string;
  }[];
  refetch: () => void;
}

// Form entry component for each input
function FormEntry({ title, half = false, name, number = false, helperText }: FormEntryProps) {
  return (
    <Grid item xs={half ? 6 : 12}>
      <p>{title}</p>
      {/* CSS glitch when type='text' and no good float input without using basic html input 
          Would rather do checking manually*/}
      <Input autoComplete="off" name={name} type={number ? 'number' : ''} fullWidth />
      <FormHelperText>{helperText ? helperText : ''}</FormHelperText>
    </Grid>
  );
}

// Form for adding a stadium
export default function StadiumForm({ optionsLeague, refetch }: StadiumFormProps) {
  const [open, setOpen] = React.useState(false);
  // usePostStadiums hook for POST request
  const { mutateAsync } = usePostStadiums();

  const handleClickOpen = () => {
    setOpen(true);
  };

  // separate handleClose to close dropdown on successful submit or cancel
  const handleClose = () => {
    setOpen(false);
  };

  // manual check for valid latitude and longitude
  function checkLatLng(lat: number, lng: number): boolean {
    return isFinite(lat) && Math.abs(lat) <= 90 && isFinite(lng) && Math.abs(lng) <= 180;
  }

  // extract the form data and convert to json before POST request
  function processJson(formData: FormData): StadiumFormData {
    let formJson: StadiumFormData = {} as StadiumFormData;
    formJson['stadium-name'] = formData.get('stadium-name') as string;
    formJson['year'] = parseInt(formData.get('year') as string);
    formJson['capacity'] = parseInt(formData.get('capacity') as string);
    formJson['team-name'] = formData.get('team-name') as string;
    formJson['league'] = formData.get('league') as string;
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);
    if (!checkLatLng(lat, lng)) {
      throw new Error('Invalid Latitude or Longitude', { cause: 'LatLngError' });
    }
    formJson['coordinates'] = { lat, lng };
    return formJson;
  }

  // submit the stadium form using mutateAsync that invokes the POST request
  async function submitStadium(currentTarget: HTMLFormElement) {
    try {
      const formJson = processJson(new FormData(currentTarget));
      await mutateAsync(formJson);
      // successful add
      alert(`Stadium ${formJson['stadium-name']} added at ${formJson.coordinates.lat}, ${formJson.coordinates.lng}`);
      // perform refetch to update the map
      refetch();
      handleClose();
    } catch (error) {
      // if error is HTTPError, extract the message from the response body and alert
      if (error instanceof HTTPError) {
        const httperror = error as HTTPError;
        // can produce meaningful message for error 400
        if (httperror.response.status === 400 && httperror.response.body !== null) {
          httperror.response.body
            .getReader()
            .read()
            .then(({ value }) => {
              let message = new TextDecoder().decode(value);
              alert(JSON.parse(message).error);
            });
        } else {
          alert(`Error: ${httperror.response.status}`);
        }
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        console.error('Unexpected error', error);
      }
    }
  }

  return (
    <>
      <Button className="w-full" variant="outlined" onClick={handleClickOpen}>
        Add Stadium
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            submitStadium(event.currentTarget);
          }
        }}>
        <DialogTitle>Add a stadium to the map</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <FormEntry title="Stadium Name" name="stadium-name" />
            <FormEntry half number title="Year built" name="year" />
            <FormEntry half number title="Capacity" name="capacity" />
            <FormEntry half title="Latitude" name="lat" helperText="Between -90 and 90" />
            <FormEntry half title="Longitude" name="lng" helperText="Between -180 and 180" />
            <FormEntry title="Team Name" name="team-name" />

            <FormControl fullWidth sx={{ marginTop: 4, marginLeft: 2, paddingTop: 1 }}>
              <InputLabel>League</InputLabel>
              <Select name="league" defaultValue={optionsLeague[0].value}>
                {optionsLeague
                  // sort in alphabetical order
                  .sort((a, b) => {
                    let name1 = a.label;
                    let name2 = b.label;
                    if (name1 < name2) return -1;
                    if (name1 > name2) return 1;
                    return 0;
                  })
                  // map to MenuItem
                  .map(({ label, value }) => (
                    <MenuItem value={value} key={value}>
                      {label}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
